/**
 * Ponto de entrada da página inicial: preenche os dados do salão e inicializa os módulos.
 */
document.addEventListener('DOMContentLoaded', function () {
  const salon = window.SALON;

  // Endereço, telefone e ano do rodapé
  window.fillSalonInfo();

  // Mapa
  const map = document.getElementById('salonMap');
  if (map) {
    map.src = 'https://www.google.com/maps?q=' + encodeURIComponent(salon.name + ', ' + salon.address) + '&output=embed';
  }

  // Link "Abrir no Google Maps"
  const mapLink = document.getElementById('mapLink');
  if (mapLink) {
    mapLink.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(salon.name + ', ' + salon.address);
  }

  // Módulos
  window.renderTeam();
  window.renderReels();
  window.setupHomeCatalogs(); // carrosséis de serviços e produtos (planilhas)
  window.setupWhatsApp();
});
