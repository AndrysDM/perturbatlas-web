/* PerturbAtlas × TCGA explorer */
'use strict';

const state = {
  cancer: null,
  lang: 'en',
  detailItem: null,
  index: null,
  summary: null,
  experiments: [],
  papers: [],
  rows: [],
  page: 1,
  pageSize: 40,
  paperRows: [],
  paperPage: 1,
  paperPageSize: 10,
  genes: [],
  geneRows: [],
  genePage: 1,
  genePageSize: 50,
  geneSummary: null,
};

const CATEGORY_LABEL = { T: 'T', N: 'N', NT: 'NT', O: 'O', Multi: 'Multi-target', Sin: 'Unclassified' };
const STATE_LABEL = {
  activado: 'activated',
  desactivado: 'deactivated',
  sin_cambio: 'no change',
  sin_transicion_valida: 'no valid transition',
  ausente: 'absent',
  sin_analisis: 'no analysis',
};
const TRANSITION_LABEL = {
  q0_to_q1: 'q0→q1',
  q1_to_q0: 'q1→q0',
  q0_to_qminus: 'q0→q−',
  qminus_to_q0: 'q−→q0',
  qminus_to_q1: 'q−→q1',
  q1_to_qminus: 'q1→q−',
  sin_cambio: 'no change',
  sin_transicion_valida: 'no valid transition',
  ausente: 'absent',
};
const CATEGORY_COLOR = { T: '#0284c7', N: '#d97706', NT: '#7c3aed', O: '#64748b', Multi: '#64748b', Sin: '#94a3b8' };
const STATE_COLOR = {
  activado: '#059669',
  desactivado: '#dc2626',
  sin_cambio: '#64748b',
  sin_transicion_valida: '#0ea5e9',
  ausente: '#94a3b8',
  sin_analisis: '#94a3b8',
};
const CATEGORY_ORDER = ['T', 'N', 'NT', 'O', 'Multi', 'Sin'];
const STATE_ORDER = ['activado', 'desactivado', 'sin_cambio', 'sin_transicion_valida', 'ausente', 'sin_analisis'];
const SOURCE_LABEL = {
  ena: 'ENA (study PubMed)',
  geo: 'GEO (series PubMed)',
  biostudies: 'BioStudies / ArrayExpress',
  accession: 'Europe PMC (accession)',
  manual: 'Manual review',
};
const EFFECTIVE_LABEL = { si: 'target changed', no: 'not changed', no_consta: 'not reported' };
const EFFECTIVE_CLASS = { si: 'activado', no: 'desactivado', no_consta: 'muted' };
const FAVOURABLE_LABEL = {
  si: 'successful',
  mixto: 'mixed',
  sin_efecto: 'no effect',
  no_consta: 'not reported',
};
const FAVOURABLE_CLASS = {
  si: 'activado',
  mixto: 'sin_cambio',
  sin_efecto: 'desactivado',
  no_consta: 'muted',
};

const CANCER_TITLES_ES = {
  'Prostate adenocarcinoma': 'Adenocarcinoma de próstata',
  'Lung adenocarcinoma': 'Adenocarcinoma de pulmón',
  'Breast cancer': 'Cáncer de mama',
};

const ES = {
  'Home': 'Inicio', 'Experiments': 'Experimentos', 'Genes': 'Genes',
  'Publications': 'Publicaciones', 'Methodology': 'Metodología',
  'Select cancer': 'Seleccionar cáncer', 'Select language': 'Seleccionar idioma',
  'Perturbation atlas': 'Atlas de perturbaciones', 'Loading…': 'Cargando…',
  'Explorer of PerturbAtlas gene-perturbation experiments integrated with the TCGA tumour classification.':
    'Explorador de experimentos de perturbación génica de PerturbAtlas integrados con la clasificación tumoral de TCGA.',
  'Testing the predictions of the theory presented in': 'Comprobación de las predicciones de la teoría expuesta en',
  'using selected data from': 'utilizando datos seleccionados de',
  'Summary by gene type': 'Resumen por tipo de gen',
  'TCGA classification (T / N / NT / O)': 'Clasificación TCGA (T / N / NT / O)',
  'Experiment categories': 'Categorías de los experimentos',
  'Experiments with a single T, N or NT target; the rest are multi-target or not analysed.':
    'Experimentos con una única diana T, N o NT; el resto son multi-diana o sin análisis.',
  'Target states': 'Estados de la diana',
  'Observed target state (sign of the log2FC after sign correction).':
    'Estado observado de la diana (signo del log2FC, tras la corrección de signo).',
  'Explore': 'Explorar',
  'Full table with search, filters, transition probability, target state and associated publication.':
    'Tabla completa con búsqueda, filtros, probabilidad de transición, estado de la diana y publicación asociada.',
  'Differential expression and percentages of samples outside the normal range, by gene and type.':
    'Expresión diferencial y porcentajes de muestras fuera del rango normal, por gen y tipo.',
  'Cards for the original articles with their summary and the experiments they cover.':
    'Fichas de los artículos originales con su resumen y los experimentos que cubren.',
  'Data derived from PerturbAtlas and TCGA. Document generated automatically;':
    'Datos derivados de PerturbAtlas y TCGA. Documento generado automáticamente;',
  'methodological details are in the': 'los detalles metodológicos están en la',
  'Data derived from PerturbAtlas and TCGA. Methodological details are in':
    'Datos derivados de PerturbAtlas y TCGA. Los detalles metodológicos están en',
  'Data derived from PerturbAtlas and TCGA. Metrics described in':
    'Datos derivados de PerturbAtlas y TCGA. Métricas descritas en',
  'Data derived from PerturbAtlas and TCGA. PubMed, DOI and ENA/GEO links in each card.':
    'Datos derivados de PerturbAtlas y TCGA. Enlaces a PubMed, DOI y ENA/GEO en cada ficha.',
  'Studies': 'Estudios', 'With analysis': 'Con análisis', 'With paper': 'Con paper',
  'Type': 'Tipo', 'Unique genes': 'Genes únicos', 'Genes in DEG': 'Genes en DEG',
  'Tumor freq. (mean)': 'Frec. tumoral (media)', 'Normal freq. (mean)': 'Frec. normal (media)',
  'Computed prob.': 'Prob. calculada',
  'The table uses the gene classification; experiments with no DEG file or an unclassified target do not reach the transition analysis.':
    'La tabla usa la clasificación génica; los experimentos con archivo DEG no disponible o diana no clasificable no llegan al análisis de transición.',
  'No classification summary.': 'Sin resumen de clasificación.', 'No data.': 'Sin datos.',
  'Could not load the data': 'No se pudieron cargar los datos',
  'How to read the data': 'Cómo se leen los datos',
  'Summary of the gene classification scheme and the experiment analysis behind this explorer.':
    'Resumen del esquema de clasificación génica y del análisis de experimentos que alimenta este explorador.',
  'Perturbation experiments': 'Experimentos de perturbación',
  'Each row is a PerturbAtlas experiment with its target, classification and transition analysis.':
    'Cada fila corresponde a un experimento de PerturbAtlas, con la diana, su clasificación y el resultado del análisis de transición.',
  'Search target, file, cell line or paper…': 'Buscar diana, archivo, línea o paper…',
  'All categories': 'Todas las categorías', 'All conditions': 'Todas las condiciones',
  'All states': 'Todos los estados', 'All types': 'Todos los tipos',
  'Analysed only': 'Solo analizados',
  'File': 'Archivo', 'Target': 'Diana', 'Cell line': 'Línea celular',
  'Category': 'Categoría', 'State': 'Estado', 'Transition': 'Transición',
  'Paper': 'Paper', 'View': 'Ver', '← Previous': '← Anterior', 'Next →': 'Siguiente →',
  'Showing': 'Mostrando', 'of': 'de',
  'No experiments match the filters.': 'No hay experimentos que coincidan con los filtros.',
  '0 experiments': '0 experimentos',
  'Expression metrics': 'Métricas de expresión',
  'Search symbol, Ensembl or type…': 'Buscar símbolo, Ensembl o tipo…',
  'By category': 'Por categoría', '|log2FC| highest': '|log2FC| mayor',
  'log2FC highest': 'log2FC mayor', 'log2FC lowest': 'log2FC menor',
  'Symbol': 'Símbolo', 'Near-activated only': 'Solo casi activados',
  'Near: ≥80% of threshold': 'Casi: ≥80 % del umbral',
  'Near: ≥90% of threshold': 'Casi: ≥90 % del umbral',
  'Near: ≥95% of threshold': 'Casi: ≥95 % del umbral',
  'Gene': 'Gen', 'log2FC TCGA (T/N)': 'log2FC TCGA (T/N)',
  'No genes match.': 'No hay genes que coincidan.', '0 genes': '0 genes',
  'Original articles': 'Artículos originales',
  'Each publication links the PerturbAtlas experiment to the article describing the data, with a brief summary.':
    'Cada publicación enlaza el experimento de PerturbAtlas con el artículo donde se describen los datos, con un resumen breve.',
  'Search by title, author, journal, PMID or target…': 'Buscar por título, autor, revista, PMID o diana…',
  'No publications match.': 'No hay publicaciones que coincidan.', '0 publications': '0 publicaciones',
  'No summary.': 'Sin resumen.', 'more': 'más',
  'Analysis': 'Análisis', 'Target type': 'Tipo de diana', 'Frequency': 'Frecuencia',
  'log2FC experiment': 'log2FC experimento', 'Probability': 'Probabilidad',
  'Note': 'Nota', 'No. of targets': 'Nº de dianas',
  'Target: expression information': 'Diana: información de expresión', 'View in Genes': 'Ver en Genes',
  'Geometric mean T': 'Media geométrica T', 'Geometric mean N': 'Media geométrica N',
  'Min T / Max T': 'Mín. T / Máx. T', 'Min N / Max N': 'Mín. N / Máx. N',
  'Samples outside the range': 'Muestras fuera del rango', 'Condition': 'Condición',
  'Samples': 'Muestras', 'Threshold': 'Umbral', 'Status': 'Estado',
  'T↓ (below the normal minimum)': 'T↓ (por debajo del mínimo normal)',
  'T↑ (above the normal maximum)': 'T↑ (por encima del máximo normal)',
  'N↓ (below the tumour minimum)': 'N↓ (por debajo del mínimo tumoral)',
  'N↑ (above the tumour maximum)': 'N↑ (por encima del máximo tumoral)',
  'activated': 'activado', 'deactivated': 'desactivado', 'near': 'casi',
  'subthreshold': 'subumbral', 'Effective T threshold:': 'Umbral efectivo T:',
  'Effective N threshold:': 'Umbral efectivo N:', 'samples': 'muestras',
  'Gene counts': 'Recuento de genes', 'Group': 'Grupo',
  'Lower frequency': 'Frecuencia menor', 'Higher frequency': 'Frecuencia mayor',
  'Activated': 'Activados', 'Deactivated': 'Desactivados',
  'Publication': 'Publicación', 'Link source:': 'Fuente del enlace:',
  'No title': 'Sin título', 'No associated publication found.': 'No se identificó una publicación asociada.',
  'Experiment summary': 'Resumen del experimento',
  'Target perturbation': 'Perturbación de la diana',
  'Measured target effect': 'Efecto medido en la diana', 'Outcome': 'Resultado',
  'consistent': 'coherente', 'not consistent': 'no coherente',
  'Cascade · H > 0.5': 'Cascada · H > 0,5', 'Target event': 'Evento de la diana',
  'target deactivation': 'desactivación de la diana', 'target activation': 'activación de la diana',
  'N lower / upper': 'N inferior / superior',
  'Cascade (possible)': 'Cascada (posibles)', 'Cascade (observed)': 'Cascada (observados)',
  'Cascade (activated)': 'Cascada (activados)', 'Cascade (deactivated)': 'Cascada (desactivados)',
  'Confirmatory': 'Confirmatorio', 'Specificity': 'Especificidad',
  'Events in R': 'Eventos en R', 'Rate in R': 'Tasa en R', 'Rate outside': 'Tasa fuera',
  'Regional rates:': 'Tasas regionales:', 'Sensitivity H=0.3:': 'Sensibilidad H=0,3:',
  'p confirmatory': 'p confirmatorio', 'p specificity': 'p especificidad',
  'Multi-target': 'Multidiana', 'Unclassified': 'Sin clasificar',
  'no change': 'sin cambio', 'no valid transition': 'sin transición válida',
  'absent': 'ausente', 'no analysis': 'sin análisis',
  'target changed': 'diana cambiada', 'not changed': 'sin cambio', 'not reported': 'no consta',
  'successful': 'exitoso', 'mixed': 'mixto', 'no effect': 'sin efecto',
  'ENA (study PubMed)': 'ENA (PubMed del estudio)', 'GEO (series PubMed)': 'GEO (PubMed de la serie)',
  'BioStudies / ArrayExpress': 'BioStudies / ArrayExpress',
  'Europe PMC (accession)': 'Europe PMC (acceso)', 'Manual review': 'Revisión manual',
  'Candidate transitions': 'Transiciones candidatas', 'Candidate': 'Candidata',
  'abstract and full text of the article': 'resumen (abstract) y texto completo del artículo',
  'abstract of the article': 'resumen (abstract) del artículo',
};

const ES_PATTERNS = [
  [/^Showing (.+) of (.+)$/, (m, a, b) => `Mostrando ${a} de ${b}`],
  [/^(.+)\. (\d+) perturbation experiments, (\d+) studies and (\d+) single-target experiments analysed\.$/,
    (m, title, a, b, c) => `${CANCER_TITLES_ES[title] || title}. ${a} experimentos de perturbación, ${b} estudios y ${c} experimentos con diana única analizados.`],
  [/^(.+): (\d+) experiments downloaded; (\d+) single-target analyses and (\d+) publications identified\.$/,
    (m, label, a, b, c) => `${label}: ${a} experimentos descargados; ${b} con diana única analizados y ${c} publicaciones identificadas.`],
  [/^(.+): ([\d.,]+) genes classified \((.+)\)\.$/,
    (m, label, n, rest) => `${label}: ${n} genes clasificados (${rest}).`],
  [/^(.+): (\d+) publications identified\. Each card links the original article and the experiments that use it\.$/,
    (m, label, n) => `${label}: ${n} publicaciones identificadas. Cada ficha enlaza el artículo original y los experimentos que lo usan.`],
  [/^(\d+) experiments? · (.+)$/,
    (m, n, rest) => `${n} ${Number(n) === 1 ? 'experimento' : 'experimentos'} · ${rest}`],
  [/^Summary generated from the (.+)\. Quoted sentences are literal\..*$/,
    (m, source) => `Resumen generado a partir del ${ES[source] || source}. Las frases entre comillas son literales. «No consta» significa que el artículo no lo detalla; «exitoso» indica que el artículo reporta un efecto claro de la perturbación, no que el efecto sea terapéuticamente bueno. El efecto medido usa el LFC de la diana: KD/KO → descenso, OE → aumento.`],
];

function locale() {
  return state.lang === 'es' ? 'es-ES' : 'en-GB';
}

function translateDom(root = document.body) {
  if (state.lang !== 'es') return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const node of nodes) {
    const value = node.nodeValue;
    if (!value || !value.trim()) continue;
    const trimmed = value.trim();
    let translated = ES[trimmed];
    if (!translated) {
      for (const [pattern, replacement] of ES_PATTERNS) {
        if (pattern.test(trimmed)) {
          translated = trimmed.replace(pattern, replacement);
          break;
        }
      }
    }
    if (translated) node.nodeValue = value.replace(trimmed, translated);
  }
  for (const attribute of ['placeholder', 'aria-label', 'title']) {
    root.querySelectorAll(`[${attribute}]`).forEach(element => {
      const value = element.getAttribute(attribute);
      if (value && ES[value]) element.setAttribute(attribute, ES[value]);
    });
  }
}

function initLanguage() {
  const params = new URLSearchParams(location.search);
  const stored = localStorage.getItem('lang');
  const requested = params.get('lang');
  state.lang = ['en', 'es'].includes(requested) ? requested
    : (['en', 'es'].includes(stored) ? stored : 'en');
  localStorage.setItem('lang', state.lang);
  document.documentElement.lang = state.lang;
  const select = document.getElementById('lang-select');
  if (select) {
    select.value = state.lang;
    select.addEventListener('change', () => {
      const url = new URL(location.href);
      url.searchParams.set('lang', select.value);
      location.href = url.toString();
    });
  }
  document.querySelectorAll('[data-lang-block]').forEach(block => {
    block.hidden = block.dataset.langBlock !== state.lang;
  });
}

function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function fmt(value, digits = 3) {
  if (value === null || value === undefined || value === '' || Number.isNaN(Number(value))) return '—';
  return Number(value).toLocaleString(locale(), { maximumFractionDigits: digits });
}

function pct(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return (Number(value) * 100).toLocaleString(locale(), { maximumFractionDigits: 1 }) + '%';
}

function transitionLabel(value) {
  if (!value) return '—';
  return TRANSITION_LABEL[value] || String(value).replaceAll('_', ' ');
}

function stateBadge(value, title = '') {
  if (!value) return '<span class="badge muted">—</span>';
  const label = STATE_LABEL[value] || value;
  const tooltip = title ? ` title="${esc(title)}"` : '';
  return `<span class="badge ${esc(value)}"${tooltip}>${esc(label)}</span>`;
}

function categoryBadge(value) {
  if (!value) return '<span class="badge muted">—</span>';
  return `<span class="badge ${esc(value)}">${esc(CATEGORY_LABEL[value] || value)}</span>`;
}

function paperBadge(paper) {
  if (!paper) return '<span class="badge muted">sin paper</span>';
  const text = paper.pmid ? `PMID ${paper.pmid}` : 'DOI';
  return `<span class="badge paper">${esc(text)}</span>`;
}

function link(url, text) {
  return `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(text)}</a>`;
}

async function getJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`No se pudo cargar ${path}`);
  return response.json();
}

async function boot() {
  initLanguage();
  const params = new URLSearchParams(location.search);
  state.index = await getJson('data/index.json');
  const wanted = params.get('cancer') || state.index.cancers[0].id;
  state.cancer = state.index.cancers.find(item => item.id === wanted) || state.index.cancers[0];

  const selector = document.getElementById('cancer-select');
  selector.innerHTML = state.index.cancers
    .map(item => `<option value="${esc(item.id)}">${esc(item.label)}</option>`)
    .join('');
  selector.value = state.cancer.id;
  selector.addEventListener('change', () => {
    const url = new URL(location.href);
    url.searchParams.set('cancer', selector.value);
    location.href = url.toString();
  });

  document.querySelectorAll('[data-nav]').forEach(anchor => {
    anchor.href = anchor.getAttribute('href') + '?cancer=' + state.cancer.id;
    if (anchor.dataset.nav === document.body.dataset.page) anchor.classList.add('active');
  });

  state.summary = await getJson(`data/${state.cancer.id}/summary.json`);
  const page = document.body.dataset.page;
  if (page === 'home') renderHome();
  if (page === 'experiments') await loadExperiments();
  if (page === 'genes') await loadGenes();
  if (page === 'papers') await loadPapers();
  if (page === 'methodology') fillMethodology();
  translateDom();
}

function renderHome() {
  const summary = state.summary;
  document.title = `${summary.label} · PerturbAtlas × TCGA`;
  document.getElementById('hero-title').textContent = summary.label;
  document.getElementById('hero-lead').textContent =
    `${summary.title}. ${summary.experiments_total} perturbation experiments, ${summary.studies} studies and ${summary.analyzed} single-target experiments analysed.`;

  const kpis = [
    [summary.experiments_total, 'Experiments'],
    [summary.studies, 'Studies'],
    [summary.papers, 'Publications'],
    [summary.analyzed, 'With analysis'],
    [summary.with_paper, 'With paper'],
    [summary.genes_total, 'Genes'],
  ];
  document.getElementById('kpis').innerHTML = kpis
    .map(([value, label]) => `<div class="kpi"><div class="value">${fmt(value, 0)}</div><div class="label">${esc(label)}</div></div>`)
    .join('');

  const typeSummary = summary.type_summary || {};
  const types = ['T', 'N', 'NT', 'O'].filter(type => typeSummary[type]);
  if (types.length) {
    const rows = types.map(type => {
      const item = typeSummary[type] || {};
      const tumor = (item.stats_frecuencia_tumoral || {}).media;
      const normal = (item.stats_frecuencia_normal || {}).media;
      return `<tr>
        <td>${categoryBadge(type)}</td>
        <td class="num">${fmt(item.experimentos, 0)}</td>
        <td class="num">${fmt(item.genes_unicos_en_experimentos, 0)}</td>
        <td class="num">${fmt(item.total_genes_df_results, 0)}</td>
        <td class="num">${pct(tumor)}</td>
        <td class="num">${pct(normal)}</td>
        <td class="num">${fmt(item.prob_calculada, 0)}</td>
      </tr>`;
    }).join('');
    document.getElementById('type-summary').innerHTML = `
      <div class="table-wrap" style="box-shadow:none;border:0">
        <table>
          <thead><tr><th>Type</th><th class="num">Experiments</th><th class="num">Unique genes</th><th class="num">Genes in DEG</th><th class="num">Tumor freq. (mean)</th><th class="num">Normal freq. (mean)</th><th class="num">Computed prob.</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <p class="note" style="margin:12px 0 0">The table uses the gene classification; experiments with no DEG file or an unclassified target do not reach the transition analysis.</p>`;
  } else {
    document.getElementById('type-summary').innerHTML = '<p class="empty">No classification summary.</p>';
  }

  renderBars('bars-categories', summary.categories || {}, CATEGORY_LABEL, CATEGORY_COLOR, CATEGORY_ORDER);
  renderBars('bars-states', summary.states || {}, STATE_LABEL, STATE_COLOR, STATE_ORDER);
  translateDom();
}

function renderBars(targetId, data, labels, colors, order = []) {
  const rank = key => {
    const index = order.indexOf(key);
    return index === -1 ? order.length : index;
  };
  const entries = Object.entries(data).sort((a, b) => rank(a[0]) - rank(b[0]) || b[1] - a[1]);
  const max = Math.max(1, ...entries.map(([, value]) => value));
  const container = document.getElementById(targetId);
  if (!entries.length) {
    container.innerHTML = '<p class="empty">No data.</p>';
    return;
  }
  container.innerHTML = entries.map(([key, value]) => {
    const label = labels[key] || key;
    const color = colors[key] || '#94a3b8';
    const width = Math.max(2, (value / max) * 100);
    return `<div class="bar-row">
      <span>${esc(label)}</span>
      <span class="bar-track"><span class="bar-fill" style="width:${width}%;background:${color}"></span></span>
      <span class="num">${fmt(value, 0)}</span>
    </div>`;
  }).join('');
}

async function loadExperiments() {
  state.experiments = await getJson(`data/${state.cancer.id}/experiments.json`);
  const categories = [...new Set(state.experiments.map(row => row.category || (row.n_targets > 1 ? 'Multi' : 'Sin')))];
  const conditions = [...new Set(state.experiments.map(row => row.condition).filter(Boolean))].sort();
  const states = [...new Set(state.experiments.map(row => row.state).filter(Boolean))];

  fillSelect('filter-category', [['', 'All categories'], ...categories.map(value => [value, CATEGORY_LABEL[value] || value])]);
  fillSelect('filter-condition', [['', 'All conditions'], ...conditions.map(value => [value, value])]);
  fillSelect('filter-state', [['', 'All states'], ...states.map(value => [value, STATE_LABEL[value] || value])]);

  document.getElementById('search').addEventListener('input', () => { state.page = 1; applyFilters(); });
  ['filter-category', 'filter-condition', 'filter-state'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => { state.page = 1; applyFilters(); });
  });
  ['only-analyzed', 'only-paper'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => { state.page = 1; applyFilters(); });
  });
  document.getElementById('prev').addEventListener('click', () => { state.page -= 1; renderExperiments(); });
  document.getElementById('next').addEventListener('click', () => { state.page += 1; renderExperiments(); });

  const dialog = document.getElementById('detail');
  document.getElementById('detail-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  document.getElementById('rows').addEventListener('click', event => {
    const button = event.target.closest('[data-file]');
    if (!button) return;
    const record = state.experiments.find(item => item.filename === button.dataset.file);
    if (record) openDetail(record);
  });

  applyFilters();

  const fileParam = new URLSearchParams(location.search).get('file');
  if (fileParam) {
    const record = state.experiments.find(item => item.filename === fileParam);
    if (record) openDetail(record);
  }
}

function fillSelect(id, options) {
  const select = document.getElementById(id);
  select.innerHTML = options.map(([value, label]) => `<option value="${esc(value)}">${esc(label)}</option>`).join('');
}

function applyFilters() {
  const query = document.getElementById('search').value.trim().toLowerCase();
  const category = document.getElementById('filter-category').value;
  const condition = document.getElementById('filter-condition').value;
  const stateFilter = document.getElementById('filter-state').value;
  const onlyAnalyzed = document.getElementById('only-analyzed').checked;
  const onlyPaper = document.getElementById('only-paper').checked;

  state.rows = state.experiments.filter(item => {
    const categoryValue = item.category || (item.n_targets > 1 ? 'Multi' : 'Sin');
    if (onlyAnalyzed && !item.analysis) return false;
    if (onlyPaper && !item.paper) return false;
    if (category && categoryValue !== category) return false;
    if (condition && item.condition !== condition) return false;
    if (stateFilter && item.state !== stateFilter) return false;
    if (!query) return true;
    const haystack = [
      item.filename, item.target, item.cell_line, item.study,
      item.category, item.state, item.transition,
      item.paper ? item.paper.title : '', item.paper ? item.paper.authors : '',
    ].join(' ').toLowerCase();
    return haystack.includes(query);
  });
  state.page = Math.min(state.page, Math.max(1, Math.ceil(state.rows.length / state.pageSize)));
  renderExperiments();
}

function renderExperiments() {
  const total = state.rows.length;
  const pages = Math.max(1, Math.ceil(total / state.pageSize));
  state.page = Math.min(Math.max(1, state.page), pages);
  const start = (state.page - 1) * state.pageSize;
  const slice = state.rows.slice(start, start + state.pageSize);

  const tbody = document.getElementById('rows');
  if (!slice.length) {
    tbody.innerHTML = '<tr><td colspan="10"><p class="empty">No experiments match the filters.</p></td></tr>';
  } else {
    tbody.innerHTML = slice.map(item => {
      const category = item.category || (item.n_targets > 1 ? 'Multi' : 'Sin');
      const probability = item.probability === null ? '—' : fmt(item.probability, 3);
      return `<tr>
        <td class="mono"><span class="filename" title="${esc(item.filename)}">${esc(item.filename)}</span></td>
        <td><strong>${esc(item.target || '—')}</strong></td>
        <td>${esc(item.condition || '—')}</td>
        <td><span class="cell-line" title="${esc(item.cell_line || '')}">${esc(item.cell_line || '—')}</span></td>
        <td>${categoryBadge(category)}</td>
        <td>${stateBadge(item.state, item.reason)}</td>
        <td class="num">${probability}</td>
        <td class="mono">${esc(transitionLabel(item.transition))}</td>
        <td>${paperBadge(item.paper)}</td>
        <td><button class="btn" type="button" data-file="${esc(item.filename)}">Ver</button></td>
      </tr>`;
    }).join('');
  }

  document.getElementById('page-info').textContent = total
    ? `Showing ${start + 1}–${Math.min(start + state.pageSize, total)} of ${total}`
    : '0 experiments';
  document.getElementById('prev').disabled = state.page <= 1;
  document.getElementById('next').disabled = state.page >= pages;
  document.getElementById('experiments-lead').textContent =
    `${state.cancer.label}: ${state.experiments.length} experiments downloaded; ${state.summary.analyzed} single-target analyses and ${state.summary.papers} publications identified.`;
  translateDom();
}

function detailItem(label, value) {
  return `<div class="detail"><div class="k">${esc(label)}</div><div class="v">${value ?? '—'}</div></div>`;
}

function countTable(block) {
  if (!block) return '<p class="note">No counts.</p>';
  return `<div class="table-wrap" style="box-shadow:none;border:0">
    <table>
      <thead><tr><th>Group</th><th class="num">n</th><th class="num">Activated</th><th class="num">Deactivated</th></tr></thead>
      <tbody>
        <tr><td>Lower frequency</td><td class="num">${fmt(block.minor.n, 0)}</td><td class="num">${fmt(block.minor.activated, 0)}</td><td class="num">${fmt(block.minor.deactivated, 0)}</td></tr>
        <tr><td>Higher frequency</td><td class="num">${fmt(block.major.n, 0)}</td><td class="num">${fmt(block.major.activated, 0)}</td><td class="num">${fmt(block.major.deactivated, 0)}</td></tr>
      </tbody>
    </table>
  </div>`;
}

function cascadeSection(item) {
  const reach = item.reachability;
  if (!reach) return '';
  const event = reach.event === 'activation' ? 'target activation' : 'target deactivation';
  const rate = value => (value === null || value === undefined) ? '—'
    : (Number(value) * 100).toLocaleString(locale(), { maximumFractionDigits: 2 }) + '%';
  const pval = value => (value === null || value === undefined) ? '—'
    : Number(value).toLocaleString(locale(), { maximumSignificantDigits: 3 });
  return `<div class="subhead">Cascade · H &gt; 0.5</div>
    <div class="detail-grid">
      ${detailItem('Target event', esc(event))}
      ${detailItem('N lower / upper', `${fmt(reach.n_lower, 0)} / ${fmt(reach.n_upper, 0)}`)}
      ${detailItem('Cascade (possible)', fmt(reach.cascade_possible, 0))}
      ${detailItem('Cascade (observed)', fmt(reach.cascade_observed, 0))}
      ${detailItem('Cascade (activated)', fmt(reach.cascade_activated, 0))}
      ${detailItem('Cascade (deactivated)', fmt(reach.cascade_deactivated, 0))}
    </div>
    <div class="table-wrap" style="box-shadow:none;border:0;margin-top:10px">
      <table>
        <thead><tr><th>Test</th><th class="num">n (R)</th><th class="num">Events in R</th><th class="num">Rate in R</th><th class="num">Rate outside</th><th class="num">p</th></tr></thead>
        <tbody>
          <tr><td>Confirmatory</td><td class="num">${fmt(reach.confirm_n, 0)}</td><td class="num">${fmt(reach.confirm_x, 0)}</td><td class="num">${rate(reach.confirm_rate_in)}</td><td class="num">${rate(reach.confirm_rate_out)}</td><td class="num">${pval(reach.confirm_p)}</td></tr>
          <tr><td>Specificity</td><td class="num">${fmt(reach.specificity_n, 0)}</td><td class="num">${fmt(reach.specificity_x, 0)}</td><td class="num">${rate(reach.specificity_rate_in)}</td><td class="num">${rate(reach.specificity_rate_out)}</td><td class="num">${pval(reach.specificity_p)}</td></tr>
        </tbody>
      </table>
    </div>
    <p class="note">Regional rates: τD&lt; = ${rate(reach.tau_d_lower)}, τA&lt; = ${rate(reach.tau_a_lower)}, τD&gt; = ${rate(reach.tau_d_upper)}, τA&gt; = ${rate(reach.tau_a_upper)}. Sensitivity H=0.3: p confirmatory = ${pval(reach.p_confirm_030)}, p specificity = ${pval(reach.p_specificity_030)}; H=0,7: ${pval(reach.p_confirm_070)} / ${pval(reach.p_specificity_070)}.</p>`;
}

function targetEffectBadge(item) {
  if (item.lfc === null || item.lfc === undefined || !item.condition) {
    return '<span class="badge muted">no consta</span>';
  }
  const condition = String(item.condition).toUpperCase();
  const down = condition.includes('KD') || condition.includes('KO');
  const up = condition.includes('OE');
  if (!down && !up) return '<span class="badge muted">no consta</span>';
  const coherent = down ? item.lfc < 0 : item.lfc > 0;
  return `<span class="badge ${coherent ? 'activado' : 'desactivado'}">${coherent ? 'consistent' : 'not consistent'}</span>
    <span class="note">LFC = ${fmt(item.lfc, 3)}</span>`;
}

function renderExperimentSummary(item) {
  const summary = item.experiment_summary;
  if (!summary) return '';
  const effective = summary.effective || 'no_consta';
  const favourable = summary.favourable || 'no_consta';
  const effectiveClass = EFFECTIVE_CLASS[effective] || 'muted';
  const favourableClass = FAVOURABLE_CLASS[favourable] || 'muted';
  const condition = item.condition || '';
  const specific = summary.condition_specific === false && favourable === 'si'
    ? (state.lang === 'es'
      ? `<span class="note">frase del estudio, no específica de ${esc(condition || 'esta condición')}</span>`
      : `<span class="note">study sentence, not specific to the ${esc(condition || 'this condition')}</span>`)
    : '';
  const source = summary.fulltext
    ? 'abstract and full text of the article'
    : 'abstract of the article';
  const summaryText = state.lang === 'es'
    ? (summary.summary_es || summary.summary || '')
    : (summary.summary || summary.summary_es || '');
  return `<div class="subhead">Experiment summary</div>
    <div class="card summary-card">
      <p class="summary-text">${esc(summaryText)}</p>
      <div class="summary-row">
        <span class="summary-label">Target perturbation</span>
        <span class="badge ${effectiveClass}">${esc(EFFECTIVE_LABEL[effective] || effective)}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">Measured target effect</span>
        ${targetEffectBadge(item)}
      </div>
      <div class="summary-row">
        <span class="summary-label">Outcome</span>
        <span class="badge ${favourableClass}">${esc(FAVOURABLE_LABEL[favourable] || favourable)}</span>
        ${specific}
      </div>
      <p class="summary-note">Summary generated from the ${source}. Quoted sentences are literal. "Not reported" means the article does not state it; "successful" means the article reports a clear effect, not that the effect is therapeutically beneficial. The measured effect uses the target LFC: KD/KO → decrease, OE → increase.</p>
    </div>`;
}

function openDetail(item) {
  const dialog = document.getElementById('detail');
  document.getElementById('detail-title').textContent = `${item.target || 'Experiment'} · ${item.condition || ''}`.trim();
  document.getElementById('detail-subtitle').textContent = item.filename;

  const analysis = item.analysis
    ? `<div class="detail-grid">
        ${detailItem('Category', categoryBadge(item.category))}
        ${detailItem('Target type', esc(item.target_type || '—'))}
        ${detailItem('Frequency', item.frequency === null ? '—' : pct(item.frequency))}
        ${detailItem('log2FC experiment', fmt(item.lfc, 3))}
        ${detailItem('Probability', item.probability === null ? '—' : fmt(item.probability, 3))}
        ${detailItem('Transition', `<span class="mono">${esc(transitionLabel(item.transition))}</span>`)}
        ${detailItem('State', stateBadge(item.state))}
      </div>
      ${item.motivo === 'gen_ausente_en_xlsx' ? '<p class="note">The target is not in the DEG of this experiment; its TCGA reference is shown.</p>' : ''}`
    : `<div class="detail-grid">
        ${detailItem('Category', categoryBadge(item.category))}
        ${detailItem('Target type', esc(item.target_type || '—'))}
        ${detailItem('Note', esc(item.reason || 'No single-target analysis.'))}
      </div>`;

  let nt = '';
  if (item.nt_candidates && item.nt_candidates.length) {
    nt = `<div class="subhead">Candidate transitions</div>
      <div class="detail-grid">
        ${item.nt_candidates.map(candidate => detailItem(
          `Candidate ${item.nt_candidates.indexOf(candidate) + 1}`,
          `<span class="mono">${esc(transitionLabel(candidate.transition))}</span> · P = ${fmt(candidate.probability, 3)}`
        )).join('')}
      </div>`;
  }

  let counts = '';
  if (item.counts && item.counts.minor) {
    counts = `<div class="subhead">Gene counts</div>${countTable(item.counts)}`;
  } else if (item.counts && item.counts.T) {
    counts = `<div class="subhead">Gene counts · T block</div>${countTable(item.counts.T)}
      <div class="subhead">Gene counts · N block</div>${countTable(item.counts.N)}`;
  }

  let paper = '';
  if (item.paper) {
    const links = [];
    if (item.paper.pmid) links.push(link(`https://pubmed.ncbi.nlm.nih.gov/${item.paper.pmid}/`, `PMID ${item.paper.pmid}`));
    if (item.paper.doi) links.push(link(`https://doi.org/${item.paper.doi}`, `DOI ${item.paper.doi}`));
    paper = `<div class="subhead">Publication</div>
      <div class="card" style="box-shadow:none">
        <h3 style="margin:0 0 6px">${esc(item.paper.title || 'No title')}</h3>
        <div class="meta">${esc(item.paper.authors || '')}${item.paper.journal ? ` · ${esc(item.paper.journal)}` : ''}${item.paper.year ? ` (${item.paper.year})` : ''}</div>
        <div style="margin-top:8px">${links.join(' · ')}</div>
        <div class="note" style="margin-top:6px">Link source: ${esc(SOURCE_LABEL[item.paper.source] || item.paper.source || '—')}</div>
        ${(() => { const text = state.lang === 'es' ? (item.paper.summary_es || item.paper.summary) : (item.paper.summary || item.paper.summary_es); return text ? `<p style="margin:12px 0 0">${esc(text)}</p>` : ''; })()}
      </div>`;
  } else {
    paper = `<div class="subhead">Publication</div><p class="note">No associated publication found.</p>`;
  }

  const meta = `<div class="detail-grid">
      ${detailItem('Cell line', esc(item.cell_line || '—'))}
      ${detailItem('No. of targets', fmt(item.n_targets, 0))}
    </div>`;

  const targetGenes = (item.target_genes && item.target_genes.length)
    ? `<div class="subhead">Target: expression information</div>${renderTargetGenes(item.target_genes)}`
    : '';
  const cascade = cascadeSection(item);
  const experimentSummary = renderExperimentSummary(item);
  document.getElementById('detail-body').innerHTML = `${meta}<div class="subhead">Analysis</div>${analysis}${targetGenes}${nt}${counts}${cascade}${experimentSummary}${paper}`;
  translateDom(dialog);
  dialog.showModal();
}

function renderTargetGenes(targets) {
  return targets.map(target => {
    const tThreshold = target.n_tumor
      ? target.min_tumor_samples / target.n_tumor : 0.1;
    const nThreshold = target.n_normal
      ? target.min_normal_samples / target.n_normal : 0.05;
    const margin = 0.8;
    const conditions = [
      ['T↓ (below the normal minimum)', target.n_t_below, target.pct_t_below,
       tThreshold, target.min_tumor_samples],
      ['T↑ (above the normal maximum)', target.n_t_above, target.pct_t_above,
       tThreshold, target.min_tumor_samples],
      ['N↓ (below the tumour minimum)', target.n_n_below, target.pct_n_below,
       nThreshold, target.min_normal_samples],
      ['N↑ (above the tumour maximum)', target.n_n_above, target.pct_n_above,
       nThreshold, target.min_normal_samples],
    ];
    const rows = conditions.map(([label, count, value, threshold, minSamples]) => {
      const active = count >= minSamples;
      const near = count >= margin * minSamples && count < minSamples;
      const status = active
        ? '<span class="badge activado">activated</span>'
        : near ? '<span class="badge sin_cambio">near</span>'
        : (count > 0 ? '<span class="badge muted">subthreshold</span>' : '<span class="badge muted">—</span>');
      return `<tr><td>${esc(label)}</td><td class="num">${fmt(count, 0)}</td>
        <td class="num">${pct(value)}</td><td class="num">${pct(threshold)}</td><td>${status}</td></tr>`;
    }).join('');

    const thresholdNote = state.lang === 'es'
      ? `Umbral efectivo T: ${pct(tThreshold)} (${fmt(target.min_tumor_samples, 0)} de ${fmt(target.n_tumor, 0)} muestras). Umbral efectivo N: ${pct(nThreshold)} (${fmt(target.min_normal_samples, 0)} de ${fmt(target.n_normal, 0)} muestras).`
      : `Effective T threshold: ${pct(tThreshold)} (${fmt(target.min_tumor_samples, 0)} of ${fmt(target.n_tumor, 0)} samples). Effective N threshold: ${pct(nThreshold)} (${fmt(target.min_normal_samples, 0)} of ${fmt(target.n_normal, 0)} samples).`;

    return `<div class="card" style="box-shadow:none;margin-bottom:12px">
      <div class="section-head" style="margin-bottom:10px">
        <h3 style="margin:0">${esc(target.symbol)} <span class="note mono">${esc(target.ensembl)}</span></h3>
        <a class="btn" href="genes.html?cancer=${esc(state.cancer.id)}&gene=${esc(target.ensembl)}">View in Genes</a>
      </div>
      <div class="detail-grid">
        ${detailItem('Type', esc(target.type || '—'))}
        ${detailItem('Category', categoryBadge(target.category))}
        ${detailItem('log2FC TCGA (T/N)', fmt(target.log2fc, 3))}
        ${detailItem('Geometric mean T', fmt(target.geo_t, 3))}
        ${detailItem('Geometric mean N', fmt(target.geo_n, 3))}
        ${detailItem('Min T / Max T', `${fmt(target.t_min, 3)} / ${fmt(target.t_max, 3)}`)}
        ${detailItem('Min N / Max N', `${fmt(target.n_min, 3)} / ${fmt(target.n_max, 3)}`)}
      </div>
      <div class="subhead">Samples outside the range</div>
      <div class="table-wrap" style="box-shadow:none;border:0">
        <table>
          <thead><tr><th>Condition</th><th class="num">Samples</th><th class="num">%</th><th class="num">Threshold</th><th>State</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <p class="note">${thresholdNote}</p>
    </div>`;
  }).join('');
}

function rowsToObjects(data) {
  return data.rows.map(row => {
    const object = {};
    data.columns.forEach((column, index) => { object[column] = row[index]; });
    return object;
  });
}

function geneThresholds() {
  const params = (state.geneSummary || {}).parametros || {};
  return {
    t: params.umbral_efectivo_t || 0.1,
    n: params.umbral_efectivo_n || 0.05,
  };
}

function geneCounts() {
  const params = (state.geneSummary || {}).parametros || {};
  return {
    t: Number(params.min_tumor_samples || 0),
    n: Number(params.min_normal_samples || 0),
  };
}

function nearGene(gene, margin = 0.8) {
  const limits = geneCounts();
  if (!limits.t || !limits.n) return false;
  const near = (count, limit) => count >= margin * limit && count < limit;
  return near(gene.n_t_below, limits.t)
      || near(gene.n_t_above, limits.t)
      || near(gene.n_n_below, limits.n)
      || near(gene.n_n_above, limits.n);
}

async function loadGenes() {
  state.geneSummary = state.summary.expression || {};
  const categories = ['T', 'N', 'NT', 'O'];
  const datasets = await Promise.all(categories.map(category =>
    getJson(`data/${state.cancer.id}/genes_${category}.json`)));
  state.genes = datasets.flatMap(data => rowsToObjects(data));

  fillSelect('gene-category', [['', 'All categories'],
    ...categories.map(category => [category, category])]);
  const types = [...new Set(state.genes.map(gene => gene.type))].sort();
  fillSelect('gene-type', [['', 'All types'],
    ...types.map(type => [type, type])]);

  document.getElementById('gene-search').addEventListener('input', () => {
    state.genePage = 1; applyGeneFilters();
  });
  ['gene-category', 'gene-type', 'gene-sort'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => {
      state.genePage = 1; applyGeneFilters();
    });
  });
  document.getElementById('gene-near').addEventListener('change', () => {
    state.genePage = 1; applyGeneFilters();
  });
  document.getElementById('gene-margin').addEventListener('change', () => {
    state.genePage = 1; applyGeneFilters();
  });
  document.getElementById('gene-prev').addEventListener('click', () => {
    state.genePage -= 1; renderGenes();
  });
  document.getElementById('gene-next').addEventListener('click', () => {
    state.genePage += 1; renderGenes();
  });

  const dialog = document.getElementById('gene-detail');
  document.getElementById('gene-detail-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  document.getElementById('gene-rows').addEventListener('click', event => {
    const button = event.target.closest('[data-gene]');
    if (!button) return;
    const gene = state.genes.find(item => item.ensembl === button.dataset.gene);
    if (gene) openGene(gene);
  });

  const counts = {};
  state.genes.forEach(gene => { counts[gene.category] = (counts[gene.category] || 0) + 1; });
  document.getElementById('genes-lead').textContent =
    `${state.cancer.label}: ${fmt(state.genes.length, 0)} genes classified (T ${fmt(counts.T || 0, 0)}, N ${fmt(counts.N || 0, 0)}, NT ${fmt(counts.NT || 0, 0)}, O ${fmt(counts.O || 0, 0)}).`;

  const params = new URLSearchParams(location.search);
  if (params.get('near') === '1') {
    document.getElementById('gene-near').checked = true;
  }
  const marginParam = params.get('margin');
  if (marginParam && ['0.8', '0.9', '0.95'].includes(marginParam)) {
    document.getElementById('gene-margin').value = marginParam;
  }

  applyGeneFilters();

  const geneParam = new URLSearchParams(location.search).get('gene');
  if (geneParam) {
    const gene = state.genes.find(item => item.ensembl === geneParam);
    if (gene) openGene(gene);
  }
}

function applyGeneFilters() {
  const query = document.getElementById('gene-search').value.trim().toLowerCase();
  const category = document.getElementById('gene-category').value;
  const type = document.getElementById('gene-type').value;
  const sort = document.getElementById('gene-sort').value;
  const near = document.getElementById('gene-near').checked;
  const margin = parseFloat(document.getElementById('gene-margin').value || '0.8');
  const order = { T: 0, N: 1, NT: 2, O: 3 };

  state.geneRows = state.genes.filter(gene => {
    if (category && gene.category !== category) return false;
    if (type && gene.type !== type) return false;
    if (near && !nearGene(gene, margin)) return false;
    if (!query) return true;
    return [gene.symbol, gene.ensembl, gene.type].join(' ').toLowerCase().includes(query);
  });

  if (sort === 'absfc') state.geneRows.sort((a, b) => Math.abs(b.log2fc) - Math.abs(a.log2fc));
  else if (sort === 'fcdesc') state.geneRows.sort((a, b) => b.log2fc - a.log2fc);
  else if (sort === 'fcasc') state.geneRows.sort((a, b) => a.log2fc - b.log2fc);
  else if (sort === 'symbol') state.geneRows.sort((a, b) => String(a.symbol).localeCompare(String(b.symbol)));
  else state.geneRows.sort((a, b) => (order[a.category] ?? 9) - (order[b.category] ?? 9)
    || Math.abs(b.log2fc) - Math.abs(a.log2fc));

  state.genePage = Math.min(state.genePage,
    Math.max(1, Math.ceil(state.geneRows.length / state.genePageSize)));
  renderGenes();
}

function pctCell(value, count, limit, margin) {
  if (value === null || value === undefined) return '<td class="num">—</td>';
  let classes = '';
  if (count >= limit) classes = 'pct-active';
  else if (count >= margin * limit && count < limit) classes = 'pct-near';
  return `<td class="num ${classes}">${pct(value)}</td>`;
}

function renderGenes() {
  const total = state.geneRows.length;
  const pages = Math.max(1, Math.ceil(total / state.genePageSize));
  state.genePage = Math.min(Math.max(1, state.genePage), pages);
  const start = (state.genePage - 1) * state.genePageSize;
  const slice = state.geneRows.slice(start, start + state.genePageSize);
  const limits = geneCounts();
  const margin = parseFloat(document.getElementById('gene-margin').value || '0.8');
  const tbody = document.getElementById('gene-rows');

  if (!slice.length) {
    tbody.innerHTML = '<tr><td colspan="9"><p class="empty">No genes match.</p></td></tr>';
  } else {
    tbody.innerHTML = slice.map(gene => `<tr>
        <td><strong>${esc(gene.symbol)}</strong><div class="note mono">${esc(gene.ensembl)}</div></td>
        <td><span class="gene-type" title="${esc(gene.type)}">${esc(gene.type)}</span></td>
        <td>${categoryBadge(gene.category)}</td>
        <td class="num">${fmt(gene.log2fc, 3)}</td>
        ${pctCell(gene.pct_t_below, gene.n_t_below, limits.t, margin)}
        ${pctCell(gene.pct_t_above, gene.n_t_above, limits.t, margin)}
        ${pctCell(gene.pct_n_below, gene.n_n_below, limits.n, margin)}
        ${pctCell(gene.pct_n_above, gene.n_n_above, limits.n, margin)}
        <td><button class="btn" type="button" data-gene="${esc(gene.ensembl)}">Ver</button></td>
      </tr>`).join('');
  }

  document.getElementById('gene-page-info').textContent = total
    ? `Showing ${start + 1}–${Math.min(start + state.genePageSize, total)} of ${fmt(total, 0)} genes`
    : '0 genes';
  document.getElementById('gene-prev').disabled = state.genePage <= 1;
  document.getElementById('gene-next').disabled = state.genePage >= pages;
  translateDom();
}

function openGene(gene) {
  const dialog = document.getElementById('gene-detail');
  const params = (state.geneSummary || {}).parametros || {};
  const thresholds = geneThresholds();
  const limits = geneCounts();
  const margin = parseFloat(document.getElementById('gene-margin').value || '0.8');
  document.getElementById('gene-detail-title').textContent = gene.symbol;
  document.getElementById('gene-detail-subtitle').textContent = `${gene.ensembl} · ${gene.type}`;

  const conditions = [
    ['T↓ (below the normal minimum)', gene.n_t_below, gene.pct_t_below, thresholds.t, limits.t],
    ['T↑ (above the normal maximum)', gene.n_t_above, gene.pct_t_above, thresholds.t, limits.t],
    ['N↓ (below the tumour minimum)', gene.n_n_below, gene.pct_n_below, thresholds.n, limits.n],
    ['N↑ (above the tumour maximum)', gene.n_n_above, gene.pct_n_above, thresholds.n, limits.n],
  ];
  const rows = conditions.map(([label, count, value, threshold, limit]) => {
    const active = count >= limit;
    const near = count >= margin * limit && count < limit;
    const status = active
      ? '<span class="badge activado">activated</span>'
      : near ? '<span class="badge sin_cambio">near</span>'
      : (count > 0 ? '<span class="badge muted">subthreshold</span>' : '<span class="badge muted">—</span>');
    return `<tr><td>${esc(label)}</td><td class="num">${fmt(count, 0)}</td>
      <td class="num">${pct(value)}</td><td class="num">${pct(threshold)}</td><td>${status}</td></tr>`;
  }).join('');

  const thresholdNote = state.lang === 'es'
    ? `Umbral efectivo T: ${pct(thresholds.t)} (${fmt(params.min_tumor_samples, 0)} de ${fmt(params.num_tumor, 0)} muestras). Umbral efectivo N: ${pct(thresholds.n)} (${fmt(params.min_normal_samples, 0)} de ${fmt(params.num_normal, 0)} muestras).`
    : `Effective T threshold: ${pct(thresholds.t)} (${fmt(params.min_tumor_samples, 0)} of ${fmt(params.num_tumor, 0)} samples). Effective N threshold: ${pct(thresholds.n)} (${fmt(params.min_normal_samples, 0)} of ${fmt(params.num_normal, 0)} samples).`;
  document.getElementById('gene-detail-body').innerHTML = `
    <div class="detail-grid">
      ${detailItem('Category', categoryBadge(gene.category))}
      ${detailItem('Type', esc(gene.type))}
      ${detailItem('log2FC TCGA (T/N)', fmt(gene.log2fc, 3))}
      ${detailItem('Geometric mean T', fmt(gene.geo_t, 3))}
      ${detailItem('Geometric mean N', fmt(gene.geo_n, 3))}
      ${detailItem('Min T / Max T', `${fmt(gene.t_min, 3)} / ${fmt(gene.t_max, 3)}`)}
      ${detailItem('Min N / Max N', `${fmt(gene.n_min, 3)} / ${fmt(gene.n_max, 3)}`)}
    </div>
    <div class="subhead">Samples outside the range</div>
    <div class="table-wrap" style="box-shadow:none;border:0">
      <table>
        <thead><tr><th>Condition</th><th class="num">Samples</th><th class="num">%</th><th class="num">Threshold</th><th>State</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <p class="note">${thresholdNote}</p>`;
  translateDom(dialog);
  dialog.showModal();
}

async function loadPapers() {
  state.papers = await getJson(`data/${state.cancer.id}/papers.json`);
  document.getElementById('paper-search').addEventListener('input', () => {
    state.paperPage = 1;
    renderPapers();
  });
  document.getElementById('paper-prev').addEventListener('click', () => { state.paperPage -= 1; renderPapers(); });
  document.getElementById('paper-next').addEventListener('click', () => { state.paperPage += 1; renderPapers(); });
  renderPapers();
}

function renderPapers() {
  if (!state.papers.length) {
    document.getElementById('paper-list').innerHTML =
      `<div class="card"><p class="note">Publications for ${esc(state.cancer.label)} are not curated yet. Experiments still include their analysis and metadata.</p></div>`;
    document.getElementById('paper-page-info').textContent = '0 publications';
    document.getElementById('paper-prev').disabled = true;
    document.getElementById('paper-next').disabled = true;
    document.getElementById('papers-lead').textContent =
      `${state.cancer.label}: publications pending curation.`;
    return;
  }
  const query = document.getElementById('paper-search').value.trim().toLowerCase();
  state.paperRows = state.papers.filter(paper => {
    if (!query) return true;
    const haystack = [paper.title, paper.authors, paper.journal, paper.summary, paper.summary_es, paper.pmid, paper.doi,
      (paper.experiments || []).join(' ')].join(' ').toLowerCase();
    return haystack.includes(query);
  });

  const total = state.paperRows.length;
  const pages = Math.max(1, Math.ceil(total / state.paperPageSize));
  state.paperPage = Math.min(Math.max(1, state.paperPage), pages);
  const start = (state.paperPage - 1) * state.paperPageSize;
  const slice = state.paperRows.slice(start, start + state.paperPageSize);

  const list = document.getElementById('paper-list');
  if (!slice.length) {
    list.innerHTML = '<p class="empty">No publications match.</p>';
  } else {
    list.innerHTML = slice.map(paper => {
      const chips = (paper.experiments || []).slice(0, 8).map(name => `<span class="chip">${esc(name)}</span>`).join('');
      const extra = (paper.experiments || []).length > 8
        ? `<span class="chip">+${paper.experiments.length - 8} more</span>` : '';
      const links = [];
      if (paper.pmid) links.push(link(`https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}/`, `PMID ${paper.pmid}`));
      if (paper.doi) links.push(link(`https://doi.org/${paper.doi}`, `DOI ${paper.doi}`));
      return `<article class="card paper-card">
        <h3>${esc(paper.title || 'No title')}</h3>
        <div class="meta">${esc(paper.authors || '')}${paper.journal ? ` · ${esc(paper.journal)}` : ''}${paper.year ? ` (${paper.year})` : ''}</div>
        <div>${links.join(' · ')}</div>
        <div class="note">Link source: ${esc(SOURCE_LABEL[paper.source] || paper.source || '—')}</div>
        ${(() => { const text = state.lang === 'es' ? (paper.summary_es || paper.summary) : (paper.summary || paper.summary_es); return text ? `<p style="margin:0">${esc(text)}</p>` : '<p class="note">No summary.</p>'; })()}
        <div class="chips">${chips}${extra}</div>
        <div class="note">${paper.n_experiments} experiment${paper.n_experiments === 1 ? '' : 's'} · ${(paper.studies || []).join(', ')}</div>
      </article>`;
    }).join('');
  }

  document.getElementById('paper-page-info').textContent = total
    ? `Showing ${start + 1}–${Math.min(start + state.paperPageSize, total)} of ${total}`
    : '0 publications';
  document.getElementById('paper-prev').disabled = state.paperPage <= 1;
  document.getElementById('paper-next').disabled = state.paperPage >= pages;
  document.getElementById('papers-lead').textContent =
    `${state.cancer.label}: ${total} publications identified. Each card links the original article and the experiments that use it.`;
  translateDom();
}

function fillMethodology() {
  document.title = state.lang === 'es'
    ? `Metodología · ${state.cancer.label} · PerturbAtlas × TCGA`
    : `Methodology · ${state.cancer.label} · PerturbAtlas × TCGA`;
  translateDom();
}

boot().catch(error => {
  console.error(error);
  document.querySelectorAll('main').forEach(main => {
    main.innerHTML = `<div class="card"><h2>Could not load the data</h2><p class="note">${esc(error.message)}</p></div>`;
  });
});
