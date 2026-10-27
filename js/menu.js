/**
 * Menu: hambúrguer mobile, sombra ao rolar e link ativo.
 */
(function () {
  const header = document.getElementById('header');
  const toggle = document.getElementById('menuToggle');
  const menu = document.getElementById('menu');
  const links = menu.querySelectorAll('a[href^="#"]:not(.btn)');

  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }

  toggle.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));

  // Fecha o menu ao clicar em um link
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

  // Fecha com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenu(false);
  });

  // Sombra do cabeçalho ao rolar
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 20);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Link ativo conforme a seção visível
  const sections = Array.from(links)
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((a) =>
            a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id)
          );
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach((s) => observer.observe(s));
  }
})();
