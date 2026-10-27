# Illumine Hair Studio — Site

Site responsivo em HTML, CSS e JavaScript puros (sem build). Basta abrir o `index.html` no navegador.

## Páginas

- `index.html`: página inicial (início, sobre, equipe, serviços, produtos e contato)
- `servicos.html`: todos os serviços, com filtro por tipo
- `produtos.html`: todos os produtos, com filtro por categoria

Serviços e produtos vêm de planilhas do Google Sheets. Na página inicial aparecem os primeiros itens de cada
planilha (6 no computador, 3 em telas menores); as páginas próprias mostram todos.

## Estrutura

```
illumine-hair-studio/
├── index.html
├── servicos.html
├── produtos.html
├── planilha-modelo/
│   └── Illumine-servicos-modelo.xlsx   # modelo para importar no Google Sheets
├── assets/
│   ├── fonts/          # coloque aqui os .woff2 da Canela (veja LEIA-ME.txt)
│   └── img/
│       └── logo.png
├── css/
│   ├── fonts.css       # @font-face da Canela
│   ├── variables.css   # cores e fontes
│   ├── base.css        # reset, botões, seções
│   ├── header.css
│   ├── hero.css
│   ├── about.css
│   ├── instagram.css   # 3 vídeos do Instagram (sem carrossel)
│   ├── carousel.css    # carrossel genérico (serviços e produtos)
│   ├── services.css    # cartões de serviço/produto
│   ├── products.css    # variação do cartão para produtos
│   ├── catalog-page.css # servicos.html e produtos.html (filtro e lista)
│   ├── team.css
│   ├── contact.css
│   ├── footer.css
│   └── responsive.css  # media queries
└── js/
    ├── config.js       # dados do salão, links das planilhas e quantidade de itens da home
    ├── data/
    │   ├── team.js             # equipe (provisório)
    │   ├── instagram.js        # links dos reels do Instagram
    │   ├── services-sample.js  # serviços de exemplo (usados sem planilha)
    │   └── products-sample.js  # produtos de exemplo (usados sem planilha)
    ├── shared.js       # dados do salão em todas as páginas
    ├── menu.js
    ├── carousel.js
    ├── sheets.js       # leitura das planilhas (serviços e produtos)
    ├── catalog-ui.js   # cartão de serviço/produto
    ├── home-catalog.js # carrosséis da home
    ├── catalog-page.js # filtro e lista de servicos.html / produtos.html
    ├── team.js
    ├── instagram.js
    ├── whatsapp.js
    └── main.js
```

## Onde editar

- **Dados do salão / WhatsApp:** `js/config.js`
- **Links das planilhas e quantidade de itens da home:** `js/config.js` (`sheets` e `home`)
- **Membros da equipe:** `js/data/team.js`
- **Reels do Instagram:** `js/data/instagram.js`
- **Cores e fontes:** `css/variables.css`
- **Fontes Canela:** arquivos em `assets/fonts/` (nomes em `assets/fonts/LEIA-ME.txt`)

Cores base: `#822025` · `#F4EFEA` · `#2B1B18` · `#D5BCA9`

## Planilha (serviços e produtos)

Importe `planilha-modelo/Illumine-servicos-modelo.xlsx` no Google Sheets. Ela tem 4 abas de dados:

| Aba | Colunas | Apoio |
|---|---|---|
| Serviços | nome, tipo, preço, duração (min), descrição, imagem | tipo só aceita valores da aba **Tipos** |
| Produtos | nome, categoria, preço, descrição, imagem | categoria só aceita valores da aba **Categorias** |

1. Em cada aba: Arquivo > Compartilhar > Publicar na Web > formato CSV.
2. Cole os links em `js/config.js`: `servicesCsvUrl`, `typesCsvUrl`, `productsCsvUrl`, `categoriesCsvUrl`.

Sem os links, o site mostra dados de exemplo. Abra `servicos.html?debug` ou `produtos.html?debug` para ver
avisos sobre linhas ignoradas (por exemplo, tipo que não existe na aba de apoio).
