/**
 * Leitura dos catálogos (serviços e produtos) a partir de abas do Google Sheets
 * publicadas como CSV. Cada catálogo usa duas abas:
 *
 *   Serviços: aba "Tipos"      (lista de tipos)      + aba "Serviços" (nome | tipo | preço | duração | descrição | imagem)
 *   Produtos: aba "Categorias" (lista de categorias) + aba "Produtos" (nome | categoria | preço | descrição | imagem)
 *
 * Regra de normalização: o tipo/categoria de cada item precisa existir na aba de apoio.
 * Item com tipo desconhecido é ignorado (e listado em catalog.warnings).
 * A ordem das linhas da aba de apoio é a ordem dos botões do filtro.
 *
 * Resultado de loadCatalog(): { types, items, warnings, source: 'sheet' | 'cache' | 'sample' }
 */
window.Sheets = (function () {
  // ---------- Definição de cada catálogo ----------

  var KINDS = {
    services: {
      cacheKey: 'illumine:catalog:services:v2',
      urlKeys: { items: 'servicesCsvUrl', types: 'typesCsvUrl' },
      sample: 'SAMPLE_SERVICES',
      typeColumn: 'tipo',
      columns: ['nome', 'tipo', 'preco', 'duracao', 'descricao', 'imagem'],
      text: {
        itemsTab: 'Serviços',
        typeDup: function (name) { return 'Tipo repetido na aba Tipos: "' + name + '"'; },
        typeUnknown: function (item, type) {
          return '"' + item + '": o tipo "' + type + '" não existe na aba Tipos. Serviço ignorado.';
        }
      }
    },
    products: {
      cacheKey: 'illumine:catalog:products:v2',
      urlKeys: { items: 'productsCsvUrl', types: 'categoriesCsvUrl' },
      sample: 'SAMPLE_PRODUCTS',
      typeColumn: 'categoria',
      columns: ['nome', 'categoria', 'preco', 'descricao', 'imagem'],
      text: {
        itemsTab: 'Produtos',
        typeDup: function (name) { return 'Categoria repetida na aba Categorias: "' + name + '"'; },
        typeUnknown: function (item, type) {
          return '"' + item + '": a categoria "' + type + '" não existe na aba Categorias. Produto ignorado.';
        }
      }
    }
  };

  // ---------- Utilidades de texto ----------

  // minúsculas, sem acentos, sem espaços sobrando: usado para comparar nomes
  function norm(text) {
    return String(text == null ? '' : text)
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  function slugify(text) {
    return norm(text).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  // ---------- CSV ----------

  function parseCsv(text) {
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

    var rows = [];
    var row = [];
    var field = '';
    var inQuotes = false;

    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (inQuotes) {
        if (c === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; }
          else inQuotes = false;
        } else {
          field += c;
        }
      } else if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        row.push(field);
        field = '';
      } else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
      } else {
        field += c;
      }
    }
    if (field !== '' || row.length) {
      row.push(field);
      rows.push(row);
    }

    // descarta linhas totalmente vazias
    return rows.filter(function (r) {
      return r.some(function (cell) { return cell.trim() !== ''; });
    });
  }

  // ---------- Preço, duração e imagem ----------

  function formatBRL(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  // Aceita "90", "90,50", "R$ 1.200,00", "90.5". Outro texto (ex.: "a partir de R$ 90") é mantido como está.
  function parsePrice(raw) {
    if (!raw) return null;
    var m = raw.match(/^\s*(?:R\$\s*)?(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2}))?\s*$/);
    var value = null;
    if (m) {
      value = parseFloat(m[1].replace(/\./g, '') + '.' + (m[2] || '0'));
    } else {
      var dot = raw.match(/^\s*(?:R\$\s*)?(\d+\.\d{1,2})\s*$/);
      if (dot) value = parseFloat(dot[1]);
    }
    if (value !== null) return { value: value, text: formatBRL(value) };
    return { value: null, text: raw };
  }

  // Número = minutos (90 -> "1h30"). Outro texto (ex.: "1h30") é mantido.
  function parseDuration(raw) {
    if (!raw) return null;
    if (/^\s*\d+\s*$/.test(raw)) {
      var minutes = parseInt(raw, 10);
      var h = Math.floor(minutes / 60);
      var m = minutes % 60;
      var text;
      if (h === 0) text = m + ' min';
      else if (m === 0) text = h + 'h';
      else text = h + 'h' + (m < 10 ? '0' + m : m);
      return { minutes: minutes, text: text };
    }
    return { minutes: null, text: raw };
  }

  // Link de compartilhamento do Drive -> endereço que funciona em <img>
  function driveImageUrl(link) {
    if (!link) return '';
    var isGoogle = /(drive|docs)\.google\.com/.test(link);
    var m = link.match(/\/d\/([\w-]{10,})/) || link.match(/[?&]id=([\w-]{10,})/);
    if (isGoogle && m) return 'https://drive.google.com/thumbnail?id=' + m[1] + '&sz=w800';
    return /^https?:\/\//i.test(link) ? link : '';
  }

  // ---------- Montagem do catálogo ----------

  // Procura as colunas pelo início do cabeçalho: "duração (min)" -> duracao
  function indexColumns(headerRow, keys) {
    var idx = {};
    headerRow.forEach(function (h, i) {
      var n = norm(h);
      keys.forEach(function (key) {
        if (idx[key] === undefined && n.indexOf(key) === 0) idx[key] = i;
      });
    });
    return idx;
  }

  function buildCatalog(typesRows, itemRows, kind) {
    var schema = KINDS[kind || 'services'];
    var warnings = [];

    // Tipos / categorias (ordem da aba = ordem do filtro)
    var types = [];
    var byKey = {};
    var usedSlugs = {};
    if (typesRows && typesRows.length) {
      var col = 0;
      typesRows[0].forEach(function (h, i) {
        if (norm(h).indexOf(schema.typeColumn) === 0) col = i;
      });
      typesRows.slice(1).forEach(function (r) {
        var name = (r[col] || '').trim();
        if (!name) return;
        var key = norm(name);
        if (byKey[key]) {
          warnings.push(schema.text.typeDup(name));
          return;
        }
        var slug = slugify(name) || 'tipo';
        var base = slug;
        var n = 2;
        while (usedSlugs[slug]) { slug = base + '-' + n++; }
        usedSlugs[slug] = true;
        var type = { name: name, slug: slug };
        types.push(type);
        byKey[key] = type;
      });
    }

    // Itens (serviços ou produtos)
    var items = [];
    if (itemRows && itemRows.length) {
      var idx = indexColumns(itemRows[0], schema.columns);
      var missing = ['nome', schema.typeColumn].filter(function (k) { return idx[k] === undefined; });
      if (missing.length) {
        warnings.push('Coluna obrigatória não encontrada na aba ' + schema.text.itemsTab + ': ' + missing.join(', '));
      } else {
        itemRows.slice(1).forEach(function (r) {
          function get(key) {
            return idx[key] === undefined ? '' : (r[idx[key]] || '').trim();
          }
          var name = get('nome');
          if (!name) return;
          var type = byKey[norm(get(schema.typeColumn))];
          if (!type) {
            warnings.push(schema.text.typeUnknown(name, get(schema.typeColumn)));
            return;
          }
          items.push({
            name: name,
            type: type.name,
            typeSlug: type.slug,
            price: parsePrice(get('preco')),
            duration: parseDuration(get('duracao')), // produtos não têm a coluna: fica null
            description: get('descricao'),
            image: driveImageUrl(get('imagem'))
          });
        });
      }
    }

    return { types: types, items: items, warnings: warnings };
  }

  // ---------- Carregamento ----------

  function fetchCsv(url) {
    return fetch(url, { cache: 'no-cache' })
      .then(function (res) {
        if (!res.ok) throw new Error('Falha ao carregar a planilha (' + res.status + ')');
        return res.text();
      })
      .then(function (text) {
        // planilha não publicada devolve uma página HTML de login
        if (/^\s*<(!doctype|html)/i.test(text)) {
          throw new Error('A planilha não está publicada na web');
        }
        return parseCsv(text);
      });
  }

  function saveCache(schema, catalog) {
    try {
      localStorage.setItem(schema.cacheKey, JSON.stringify({ savedAt: Date.now(), catalog: catalog }));
    } catch (e) { /* armazenamento indisponível: ignora */ }
  }

  function readCache(schema) {
    try {
      var saved = JSON.parse(localStorage.getItem(schema.cacheKey));
      return saved && saved.catalog ? saved.catalog : null;
    } catch (e) {
      return null;
    }
  }

  function loadCatalog(kind) {
    kind = kind || 'services';
    var schema = KINDS[kind];
    var cfg = (window.SALON && window.SALON.sheets) || {};
    var itemsUrl = cfg[schema.urlKeys.items] || '';
    var typesUrl = cfg[schema.urlKeys.types] || '';

    // Nenhum link configurado: usa os dados de exemplo
    if (!itemsUrl && !typesUrl) {
      var sample = window[schema.sample];
      if (!sample) return Promise.reject(new Error('Dados de exemplo não encontrados'));
      var demo = buildCatalog(sample.types, sample.items, kind);
      demo.source = 'sample';
      return Promise.resolve(demo);
    }

    // Só um dos dois links configurado: avisa em vez de misturar com exemplo
    if (!itemsUrl || !typesUrl) {
      return Promise.reject(new Error(
        'Configure os dois links em js/config.js: ' + schema.urlKeys.items + ' e ' + schema.urlKeys.types
      ));
    }

    return Promise.all([fetchCsv(typesUrl), fetchCsv(itemsUrl)])
      .then(function (results) {
        var catalog = buildCatalog(results[0], results[1], kind);
        saveCache(schema, catalog);
        catalog.source = 'sheet';
        return catalog;
      })
      .catch(function (err) {
        var cached = readCache(schema);
        if (cached) {
          cached.source = 'cache';
          return cached;
        }
        throw err;
      });
  }

  return {
    norm: norm,
    slugify: slugify,
    parseCsv: parseCsv,
    parsePrice: parsePrice,
    parseDuration: parseDuration,
    driveImageUrl: driveImageUrl,
    buildCatalog: buildCatalog,
    loadCatalog: loadCatalog
  };
})();
