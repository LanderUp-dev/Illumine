/**
 * Carrossel reutilizável baseado em scroll-snap.
 * Uso: const c = Carousel.init(document.getElementById('meuCarrossel'));
 *      c.update();  // chame depois de trocar os itens do carrossel
 * Chamar init() de novo no mesmo elemento devolve a mesma instância.
 */
window.Carousel = (function () {
  function init(root) {
    if (!root) return null;
    if (root._carousel) return root._carousel;

    const track = root.querySelector('.carousel__track');
    const prev = root.querySelector('.carousel__btn--prev');
    const next = root.querySelector('.carousel__btn--next');

    function step() {
      const first = track.firstElementChild;
      if (!first) return track.clientWidth;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return first.getBoundingClientRect().width + gap;
    }

    function updateButtons() {
      const max = track.scrollWidth - track.clientWidth - 2;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max;
    }

    prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));

    // Navegação por teclado com o foco no carrossel
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); next.click(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev.click(); }
    });

    track.addEventListener('scroll', updateButtons, { passive: true });
    window.addEventListener('resize', updateButtons);

    const api = {
      // volta ao início e recalcula os botões (use após trocar os itens)
      update: function () {
        track.scrollTo({ left: 0, behavior: 'auto' });
        updateButtons();
      },
      refresh: updateButtons
    };

    root._carousel = api;
    updateButtons();
    return api;
  }

  return { init: init };
})();
