/**
 * Renderiza os cartões da equipe a partir de js/data/team.js
 * e informa a quantidade de membros ao CSS (data-count) para o layout se adaptar.
 */
window.renderTeam = function () {
  const grid = document.getElementById('teamGrid');
  if (!grid || !Array.isArray(window.TEAM)) return;

  grid.innerHTML = '';
  grid.dataset.count = String(window.TEAM.length);

  function initials(name) {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join('');
  }

  window.TEAM.forEach((member) => {
    const card = document.createElement('article');
    card.className = 'team-card';

    // Aro em relevo + círculo com a imagem
    const photo = document.createElement('div');
    photo.className = 'team-card__photo';

    const inner = document.createElement('div');
    inner.className = 'team-card__photo-inner';

    if (member.photo) {
      const img = document.createElement('img');
      img.src = member.photo;
      img.alt = 'Foto de ' + member.name;
      img.loading = 'lazy';
      inner.appendChild(img);
    } else {
      const span = document.createElement('span');
      span.className = 'team-card__initials';
      span.textContent = initials(member.name);
      inner.appendChild(span);
    }

    photo.appendChild(inner);

    const name = document.createElement('h3');
    name.className = 'team-card__name';
    name.textContent = member.name;

    const role = document.createElement('p');
    role.className = 'team-card__role';
    role.textContent = member.role;

    card.append(photo, name, role);

    if (member.bio) {
      const bio = document.createElement('p');
      bio.className = 'team-card__bio';
      bio.textContent = member.bio;
      card.appendChild(bio);
    }

    grid.appendChild(card);
  });
};
