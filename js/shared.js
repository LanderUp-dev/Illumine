/**
 * Preenche, em qualquer página, os dados do salão (js/config.js):
 * endereço, telefone e ano do rodapé.
 */
window.fillSalonInfo = function () {
  const salon = window.SALON;

  document.querySelectorAll('[data-salon="address"]').forEach((el) => {
    el.textContent = salon.address;
  });

  document.querySelectorAll('[data-salon="phoneLink"]').forEach((el) => {
    el.textContent = salon.phoneDisplay;
    el.href = 'tel:+' + salon.whatsappNumber;
  });

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
};
