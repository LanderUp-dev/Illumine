/**
 * Carrosséis da página inicial (serviços e produtos), alimentados pelas planilhas.
 * Mostra os primeiros itens da planilha: 6 no computador e 3 nas telas menores
 * (valores e largura de corte em js/config.js > home).
 */
window.setupHomeCatalogs = function () {
  var home = (window.SALON && window.SALON.home) || {};
  var desktopCount = home.desktopCount || 6;
  var compactCount = home.compactCount || 3;
  var desktopMinWidth = home.desktopMinWidth || 993;

  var mq = window.matchMedia('(min-width: ' + desktopMinWidth + 'px)');
  function limit() {
    return mq.matches ? desktopCount : compactCount;
  }

  var blocks = [
    {
      kind: 'services',
      carousel: 'servicesCarousel',
      track: 'servicesTrack',
      status: 'servicesStatus',
      loading: 'Carregando serviços…',
      empty: 'Nenhum serviço cadastrado no momento.',
      error: 'Não foi possível carregar os serviços agora.'
    },
    {
      kind: 'products',
      carousel: 'productsCarousel',
      track: 'productsTrack',
      status: 'productsStatus',
      loading: 'Carregando produtos…',
      empty: 'Nenhum produto cadastrado no momento.',
      error: 'Não foi possível carregar os produtos agora.'
    }
  ];

  blocks.forEach(function (block) {
    var carouselEl = document.getElementById(block.carousel);
    var trackEl = document.getElementById(block.track);
    var statusEl = document.getElementById(block.status);
    if (!carouselEl || !trackEl || !statusEl) return;

    var catalog = null;

    function setStatus(text) {
      statusEl.textContent = text;
      statusEl.hidden = !text;
    }

    function render() {
      if (!catalog) return;

      var items = catalog.items.slice(0, limit());
      trackEl.innerHTML = '';

      if (!items.length) {
        carouselEl.hidden = true;
        setStatus(block.empty);
        return;
      }

      items.forEach(function (item) {
        trackEl.appendChild(window.CatalogUI.buildCard(item, block.kind));
      });

      carouselEl.hidden = false;
      setStatus('');
      window.Carousel.init(carouselEl).update();
    }

    carouselEl.hidden = true;
    setStatus(block.loading);

    window.Sheets.loadCatalog(block.kind)
      .then(function (result) {
        catalog = result;
        render();
      })
      .catch(function () {
        carouselEl.hidden = true;
        setStatus(block.error);
      });

    // Ao girar o aparelho ou redimensionar a janela, refaz a lista com a quantidade certa
    if (mq.addEventListener) mq.addEventListener('change', render);
    else mq.addListener(render);
  });
};
