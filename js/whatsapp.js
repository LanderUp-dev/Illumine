/**
 * Formulário de contato -> abre conversa no WhatsApp do salão.
 */
window.setupWhatsApp = function () {
  const salon = window.SALON;
  const form = document.getElementById('whatsappForm');
  const floatBtn = document.getElementById('whatsappFloat');
  const errorBox = document.getElementById('formError');

  function buildUrl(text) {
    return 'https://wa.me/' + salon.whatsappNumber + '?text=' + encodeURIComponent(text);
  }

  // Botão flutuante
  if (floatBtn) {
    floatBtn.href = buildUrl(salon.whatsappGreeting);
  }

  if (!form) return;

  function showError(message, fields) {
    errorBox.textContent = message;
    errorBox.hidden = false;
    fields.forEach((f) => f.classList.add('is-invalid'));
  }

  function clearError() {
    errorBox.hidden = true;
    form.querySelectorAll('.is-invalid').forEach((f) => f.classList.remove('is-invalid'));
  }

  form.addEventListener('input', clearError);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearError();

    const nameField = form.elements['name'];
    const messageField = form.elements['message'];
    const name = nameField.value.trim();
    const message = messageField.value.trim();

    const invalid = [];
    if (!name) invalid.push(nameField);
    if (!message) invalid.push(messageField);

    if (invalid.length) {
      showError('Preencha seu nome e a mensagem para continuar.', invalid);
      invalid[0].focus();
      return;
    }

    const text = 'Olá, meu nome é ' + name + '.\n' + message;
    const url = buildUrl(text);
    const opened = window.open(url, '_blank', 'noopener');

    // Se o navegador bloquear a nova aba, mostra um link para continuar
    const fallback = document.getElementById('formFallback');
    const fallbackLink = document.getElementById('formFallbackLink');
    if (fallback && fallbackLink) {
      fallbackLink.href = url;
      fallback.hidden = !!opened;
    }

    form.reset();
  });
};
