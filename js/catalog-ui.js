/**
 * Peças de interface compartilhadas pelos catálogos (serviços e produtos):
 * o cartão usado nos carrosséis da home e nas páginas servicos.html / produtos.html.
 */
window.CatalogUI = (function () {
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // kind: 'services' | 'products'; item vem de Sheets.buildCatalog()
  function buildCard(item, kind) {
    var card = el('article', 'service-card' + (kind === 'products' ? ' service-card--product' : ''));

    var media = el('div', 'service-card__media');
    var img = document.createElement('img');

    function usePlaceholder() {
      img.onerror = null;
      img.src = 'assets/img/logo.png';
      img.alt = '';
      img.className = 'service-card__placeholder';
    }

    if (item.image) {
      img.src = item.image;
      img.alt = item.name;
      img.loading = 'lazy';
      img.referrerPolicy = 'no-referrer';
      img.onerror = usePlaceholder; // imagem do Drive indisponível: mostra a logo
    } else {
      usePlaceholder();
    }
    media.appendChild(img);

    var body = el('div', 'service-card__body');
    body.appendChild(el('h3', 'service-card__title', item.name));

    if (item.duration || item.price) {
      var meta = el('p', 'service-card__meta');
      if (item.duration) meta.appendChild(el('span', 'service-card__duration', item.duration.text));
      if (item.price) meta.appendChild(el('span', 'service-card__price', item.price.text));
      body.appendChild(meta);
    }

    if (item.description) {
      body.appendChild(el('p', 'service-card__text', item.description));
    }

    card.append(media, body);
    return card;
  }

  return { el: el, buildCard: buildCard };
})();
