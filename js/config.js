/**
 * Informações do salão — edite aqui para atualizar o site inteiro.
 */
window.SALON = {
  name: 'Illumine Hair Studio',
  address: 'Pátio Bahamas São Vicente - Av. Barão do Rio Branco, 3760 - Lj 04 - Passos, Juiz de Fora - MG, 36025-020',
  phoneDisplay: '(32) 98886-7461',
  // Número no formato internacional, apenas dígitos (55 = Brasil, 32 = DDD)
  whatsappNumber: '5532988867461',
  whatsappGreeting: 'Olá! Vim pelo site do Illumine Hair Studio.',

  /**
   * Planilhas do Google Sheets usadas na página de serviços (servicos.html).
   * Publique cada aba em Arquivo > Compartilhar > Publicar na Web (formato CSV)
   * e cole os links abaixo. Enquanto estiverem vazios, a página mostra dados de exemplo.
   */
  sheets: {
    servicesCsvUrl: '',   // link CSV da aba "Serviços"
    typesCsvUrl: '',      // link CSV da aba "Tipos"
    productsCsvUrl: '',   // link CSV da aba "Produtos"
    categoriesCsvUrl: ''  // link CSV da aba "Categorias"
  },

  /**
   * Quantos itens aparecem nos carrosséis da página inicial (serviços e produtos).
   * Os primeiros da planilha: desktopCount em telas a partir de desktopMinWidth (px),
   * compactCount nas telas menores.
   */
  home: {
    desktopCount: 6,
    compactCount: 3,
    desktopMinWidth: 993
  }
};
