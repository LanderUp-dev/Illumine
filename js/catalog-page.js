/**
 * Páginas de catálogo (servicos.html e produtos.html):
 * carrega o catálogo da planilha, monta o filtro por tipo/categoria e a lista de itens.
 * O catálogo é escolhido por <body data-catalog="services"> ou <body data-catalog="products">.
 *
 * Dica: abra a página com ?debug no endereço para ver, na tela, avisos sobre linhas
 * da planilha que foram ignoradas (por exemplo, tipo que não existe na aba de apoio).
 */
document.addEventListener('DOMContentLoaded', function () {
  const kind = document.body.getAttribute('data-catalog') === 'products' ? 'products' : 'services';

  const TEXT = {
    services: {
      one: 'serviço',
      many: 'serviços',
      loading: 'Carregando serviços…',
      error: 'Não foi possível carregar os serviços agora.',
      empty: 'Nenhum serviço cadastrado no momento.'
    },
    products: {
      one: 'produto',
      many: 'produtos',
      loading: 'Carregando produtos…',
      error: 'Não foi possível carregar os produtos agora.',
      empty: 'Nenhum produto cadastrado no momento.'
    }
  }[kind];

  window.fillSalonInfo();
  window.setupWhatsApp();

  const el = window.CatalogUI.el;
  const filtersEl = document.getElementById('catalogFilters');
  const listEl = document.getElementById('catalogList');
  const statusEl = document.getElementById('catalogStatus');
  const noticeEl = document.getElementById('catalogNotice');
  const debug = new URLSearchParams(window.location.search).has('debug');

  let catalog = null;
  let active = ''; // slug do tipo selecionado; vazio = todos

  function whatsappUrl() {
    const s = window.SALON;
    return 'https://wa.me/' + s.whatsappNumber + '?text=' + encodeURIComponent(s.whatsappGreeting);
  }

  // ---------- Dados derivados ----------

  function itemsOf(type) {
    return catalog.items.filter((s) => s.typeSlug === type.slug);
  }

  // só aparecem no filtro os tipos que têm ao menos um item
  function visibleTypes() {
    return catalog.types.filter((t) => itemsOf(t).length > 0);
  }

  // ---------- Filtro ----------

  function renderFilters() {
    filtersEl.innerHTML = '';

    function chip(label, count, slug) {
      const btn = el('button', 'filter__chip');
      btn.type = 'button';
      btn.setAttribute('aria-pressed', String(active === slug));
      if (active === slug) btn.classList.add('is-active');
      btn.appendChild(el('span', 'filter__label', label));
      btn.appendChild(el('span', 'filter__count', String(count)));
      btn.addEventListener('click', () => setActive(slug, true));
      filtersEl.appendChild(btn);
    }

    chip('Todos', catalog.items.length, '');
    visibleTypes().forEach((t) => chip(t.name, itemsOf(t).length, t.slug));
  }

  function setActive(slug, updateUrl) {
    const valid = visibleTypes().some((t) => t.slug === slug);
    active = valid ? slug : '';

    if (updateUrl) {
      try {
        history.replaceState(null, '', active ? '#' + active : window.location.pathname + window.location.search);
      } catch (e) { /* ambiente sem suporte: ignora */ }
    }

    renderFilters();
    renderList();
  }

  // ---------- Lista ----------

  function renderList() {
    listEl.innerHTML = '';

    const groups = visibleTypes().filter((t) => !active || t.slug === active);
    let total = 0;

    groups.forEach((type) => {
      const items = itemsOf(type);
      total += items.length;

      const group = el('section', 'catalog__group');
      const title = el('h2', 'catalog__group-title', type.name);
      title.id = 'grupo-' + type.slug;
      group.setAttribute('aria-labelledby', title.id);

      const grid = el('div', 'catalog__grid');
      items.forEach((item) => grid.appendChild(window.CatalogUI.buildCard(item, kind)));

      group.append(title, grid);
      listEl.appendChild(group);
    });

    statusEl.textContent = total + ' ' + (total === 1 ? TEXT.one : TEXT.many);
  }

  // ---------- Avisos e estados ----------

  function showNotice() {
    noticeEl.innerHTML = '';
    noticeEl.hidden = true;

    const messages = [];
    if (catalog.source === 'sample') {
      messages.push('Exibindo dados de exemplo. Configure os links das planilhas em js/config.js.');
    }
    if (catalog.source === 'cache') {
      messages.push('Não foi possível atualizar a lista agora. Mostrando a última versão salva neste aparelho.');
    }
    messages.forEach((m) => noticeEl.appendChild(el('p', '', m)));

    if (debug && catalog.warnings.length) {
      const details = el('details', 'catalog__warnings');
      details.open = true;
      details.appendChild(el('summary', '', catalog.warnings.length + ' aviso(s) sobre a planilha'));
      const ul = el('ul');
      catalog.warnings.forEach((w) => ul.appendChild(el('li', '', w)));
      details.appendChild(ul);
      noticeEl.appendChild(details);
    }

    noticeEl.hidden = noticeEl.childElementCount === 0;
  }

  function showError() {
    filtersEl.innerHTML = '';
    listEl.innerHTML = '';
    noticeEl.hidden = true;
    statusEl.textContent = '';

    const box = el('div', 'catalog__error');
    box.appendChild(el('p', '', TEXT.error));

    const actions = el('div', 'catalog__error-actions');
    const retry = el('button', 'btn btn--small', 'Tentar novamente');
    retry.type = 'button';
    retry.addEventListener('click', load);
    const wa = el('a', 'btn btn--small', 'Falar pelo WhatsApp');
    wa.href = whatsappUrl();
    wa.target = '_blank';
    wa.rel = 'noopener';
    actions.append(retry, wa);

    box.appendChild(actions);
    listEl.appendChild(box);
  }

  function showEmpty() {
    filtersEl.innerHTML = '';
    listEl.innerHTML = '';
    statusEl.textContent = TEXT.empty;
  }

  // ---------- Carregamento ----------

  function load() {
    statusEl.textContent = TEXT.loading;
    listEl.innerHTML = '';
    filtersEl.innerHTML = '';
    noticeEl.hidden = true;

    window.Sheets.loadCatalog(kind)
      .then((result) => {
        catalog = result;
        showNotice();
        if (!catalog.items.length) {
          showEmpty();
          return;
        }
        const fromHash = decodeURIComponent(window.location.hash.replace(/^#/, ''));
        setActive(fromHash, false);
      })
      .catch(showError);
  }

  // link direto para uma categoria, ex.: servicos.html#coloracao
  window.addEventListener('hashchange', () => {
    if (catalog && catalog.items.length) {
      setActive(decodeURIComponent(window.location.hash.replace(/^#/, '')), false);
    }
  });

  load();
});
