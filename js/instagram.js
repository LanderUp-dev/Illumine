/**
 * Monta a grade fixa de reels do Instagram (dados em js/data/instagram.js)
 * e carrega o script oficial de incorporação do Instagram.
 */
window.renderReels = function () {
  const track = document.getElementById('reelsGrid');
  const data = window.INSTAGRAM;
  if (!track || !data || !Array.isArray(data.reels)) return;

  track.innerHTML = '';

  data.reels.forEach((url) => {
    const item = document.createElement('div');
    item.className = 'reel-card';

    const quote = document.createElement('blockquote');
    quote.className = 'instagram-media';
    quote.setAttribute('data-instgrm-captioned', '');
    quote.setAttribute('data-instgrm-permalink', url + '?utm_source=ig_embed&utm_campaign=loading');
    quote.setAttribute('data-instgrm-version', '14');

    // Conteúdo exibido enquanto o Instagram não carrega (ou se estiver bloqueado)
    const link = document.createElement('a');
    link.className = 'reel-card__link';
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = 'Ver este vídeo no Instagram';

    quote.appendChild(link);
    item.appendChild(quote);
    track.appendChild(item);
  });

  // Botão "Seguir no Instagram"
  const profile = document.getElementById('instagramLink');
  if (profile && data.profileUrl) {
    profile.href = data.profileUrl;
    profile.textContent = 'Seguir ' + (data.handle || 'no Instagram');
  }

  loadEmbedScript();
};

function loadEmbedScript() {
  function process() {
    if (window.instgrm && window.instgrm.Embeds) window.instgrm.Embeds.process();
  }

  if (window.instgrm) {
    process();
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.instagram.com/embed.js';
  script.onload = process;
  document.body.appendChild(script);
}
