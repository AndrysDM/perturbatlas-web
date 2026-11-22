/* Explorador de experimentos PerturbAtlas × TCGA */
'use strict';

const state = {
  cancer: null,
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

const CATEGORY_LABEL = { T: 'T', N: 'N', NT: 'NT', O: 'O', Multi: 'Multi-diana', Sin: 'Sin clasificar' };
const STATE_LABEL = {
  activado: 'activado',
  desactivado: 'desactivado',
  sin_cambio: 'sin cambio',
  sin_transicion_valida: 'sin transición válida',
  ausente: 'ausente',
  sin_analisis: 'sin análisis',
};
const TRANSITION_LABEL = {
  q0_to_q1: 'q0→q1',
  q1_to_q0: 'q1→q0',
  q0_to_qminus: 'q0→q−',
  qminus_to_q0: 'q−→q0',
  qminus_to_q1: 'q−→q1',
  q1_to_qminus: 'q1→q−',
  sin_cambio: 'sin cambio',
  sin_transicion_valida: 'sin transición válida',
  ausente: 'ausente',
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
  ena: 'ENA (PubMed del estudio)',
  geo: 'GEO (PubMed de la serie)',
  biostudies: 'BioStudies / ArrayExpress',
  accession: 'Europe PMC (acceso)',
  manual: 'Revisión manual',
};

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
  return Number(value).toLocaleString('es-ES', { maximumFractionDigits: digits });
}

function pct(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return (Number(value) * 100).toLocaleString('es-ES', { maximumFractionDigits: 1 }) + '%';
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
}

function renderHome() {
  const summary = state.summary;
  document.title = `${summary.label} · PerturbAtlas × TCGA`;
  document.getElementById('hero-title').textContent = summary.label;
  document.getElementById('hero-lead').textContent =
    `${summary.title}. ${summary.experiments_total} experimentos de perturbación, ${summary.studies} estudios y ${summary.analyzed} experimentos con diana única analizada.`;

  const kpis = [
    [summary.experiments_total, 'Experimentos'],
    [summary.studies, 'Estudios'],
    [summary.papers, 'Publicaciones'],
    [summary.analyzed, 'Con análisis'],
    [summary.with_paper, 'Con paper'],
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
          <thead><tr><th>Tipo</th><th class="num">Experimentos</th><th class="num">Genes únicos</th><th class="num">Genes en DEG</th><th class="num">Frec. tumoral (media)</th><th class="num">Frec. normal (media)</th><th class="num">Prob. calculada</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <p class="note" style="margin:12px 0 0">La tabla usa la clasificación génica; los experimentos con archivo DEG no disponible o diana no clasificable no llegan al análisis de transición.</p>`;
  } else {
    document.getElementById('type-summary').innerHTML = '<p class="empty">Sin resumen de clasificación.</p>';
  }

  renderBars('bars-categories', summary.categories || {}, CATEGORY_LABEL, CATEGORY_COLOR, CATEGORY_ORDER);
  renderBars('bars-states', summary.states || {}, STATE_LABEL, STATE_COLOR, STATE_ORDER);
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
    container.innerHTML = '<p class="empty">Sin datos.</p>';
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

  fillSelect('filter-category', [['', 'Todas las categorías'], ...categories.map(value => [value, CATEGORY_LABEL[value] || value])]);
  fillSelect('filter-condition', [['', 'Todas las condiciones'], ...conditions.map(value => [value, value])]);
  fillSelect('filter-state', [['', 'Todos los estados'], ...states.map(value => [value, STATE_LABEL[value] || value])]);

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
    tbody.innerHTML = '<tr><td colspan="10"><p class="empty">No hay experimentos que coincidan con los filtros.</p></td></tr>';
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
    ? `Mostrando ${start + 1}–${Math.min(start + state.pageSize, total)} de ${total}`
    : '0 experimentos';
  document.getElementById('prev').disabled = state.page <= 1;
  document.getElementById('next').disabled = state.page >= pages;
  document.getElementById('experiments-lead').textContent =
    `${state.cancer.label}: ${state.experiments.length} experimentos descargados; ${state.summary.analyzed} con diana única analizada y ${state.summary.papers} publicaciones identificadas.`;
}

function detailItem(label, value) {
  return `<div class="detail"><div class="k">${esc(label)}</div><div class="v">${value ?? '—'}</div></div>`;
}

function countTable(block) {
  if (!block) return '<p class="note">Sin recuentos.</p>';
  return `<div class="table-wrap" style="box-shadow:none;border:0">
    <table>
      <thead><tr><th>Grupo</th><th class="num">n</th><th class="num">Activados</th><th class="num">Desactivados</th><th class="num">Sin cambio</th></tr></thead>
      <tbody>
        <tr><td>Frecuencia menor</td><td class="num">${fmt(block.minor.n, 0)}</td><td class="num">${fmt(block.minor.activated, 0)}</td><td class="num">${fmt(block.minor.deactivated, 0)}</td><td class="num">${fmt(block.minor.no_change, 0)}</td></tr>
        <tr><td>Frecuencia mayor</td><td class="num">${fmt(block.major.n, 0)}</td><td class="num">${fmt(block.major.activated, 0)}</td><td class="num">${fmt(block.major.deactivated, 0)}</td><td class="num">${fmt(block.major.no_change, 0)}</td></tr>
        <tr><td>Frecuencia igual</td><td class="num">${fmt(block.equal, 0)}</td><td class="num">—</td><td class="num">—</td><td class="num">—</td></tr>
      </tbody>
    </table>
  </div>`;
}

function openDetail(item) {
  const dialog = document.getElementById('detail');
  document.getElementById('detail-title').textContent = `${item.target || 'Experimento'} · ${item.condition || ''}`.trim();
  document.getElementById('detail-subtitle').textContent = `${item.filename} · ${item.study || ''}`;

  const analysis = item.analysis
    ? `<div class="detail-grid">
        ${detailItem('Categoría', categoryBadge(item.category))}
        ${detailItem('Tipo de diana', esc(item.target_type || '—'))}
        ${detailItem('Frecuencia', item.frequency === null ? '—' : pct(item.frequency))}
        ${detailItem('log2FC', fmt(item.lfc, 3))}
        ${detailItem('Probabilidad', item.probability === null ? '—' : fmt(item.probability, 3))}
        ${detailItem('Transición', `<span class="mono">${esc(transitionLabel(item.transition))}</span>`)}
        ${detailItem('Transición evaluada', item.evaluated ? `<span class="mono">${esc(transitionLabel(item.evaluated))}</span>` : '—')}
        ${detailItem('Estado', stateBadge(item.state))}
        ${detailItem('H de Loevinger', fmt(item.h_loevinger, 3))}
        ${detailItem('Motivo', esc(item.motivo || '—'))}
      </div>`
    : `<div class="detail-grid">
        ${detailItem('Categoría', categoryBadge(item.category))}
        ${detailItem('Tipo de diana', esc(item.target_type || '—'))}
        ${detailItem('Motivo', esc(item.reason || 'Sin análisis de diana única.'))}
      </div>`;

  let nt = '';
  if (item.nt_candidates && item.nt_candidates.length) {
    nt = `<div class="subhead">Transiciones candidatas</div>
      <div class="detail-grid">
        ${item.nt_candidates.map(candidate => detailItem(
          `Candidata ${item.nt_candidates.indexOf(candidate) + 1}`,
          `<span class="mono">${esc(transitionLabel(candidate.transition))}</span> · P = ${fmt(candidate.probability, 3)}`
        )).join('')}
      </div>`;
  }

  let counts = '';
  if (item.counts && item.counts.minor) {
    counts = `<div class="subhead">Recuento de genes</div>${countTable(item.counts)}`;
  } else if (item.counts && item.counts.T) {
    counts = `<div class="subhead">Recuento de genes · bloque T</div>${countTable(item.counts.T)}
      <div class="subhead">Recuento de genes · bloque N</div>${countTable(item.counts.N)}`;
  }

  let paper = '';
  if (item.paper) {
    const links = [];
    if (item.paper.pmid) links.push(link(`https://pubmed.ncbi.nlm.nih.gov/${item.paper.pmid}/`, `PMID ${item.paper.pmid}`));
    if (item.paper.doi) links.push(link(`https://doi.org/${item.paper.doi}`, `DOI ${item.paper.doi}`));
    paper = `<div class="subhead">Publicación</div>
      <div class="card" style="box-shadow:none">
        <h3 style="margin:0 0 6px">${esc(item.paper.title || 'Sin título')}</h3>
        <div class="meta">${esc(item.paper.authors || '')}${item.paper.journal ? ` · ${esc(item.paper.journal)}` : ''}${item.paper.year ? ` (${item.paper.year})` : ''}</div>
        <div style="margin-top:8px">${links.join(' · ')}</div>
        <div class="note" style="margin-top:6px">Fuente del enlace: ${esc(SOURCE_LABEL[item.paper.source] || item.paper.source || '—')}</div>
        ${item.paper.summary ? `<p style="margin:12px 0 0">${esc(item.paper.summary)}</p>` : ''}
      </div>`;
  } else {
    paper = `<div class="subhead">Publicación</div><p class="note">No se identificó una publicación asociada.</p>`;
  }

  const meta = `<div class="detail-grid">
      ${detailItem('Línea celular', esc(item.cell_line || '—'))}
      ${detailItem('Tratamiento', esc(item.treatment || '—'))}
      ${detailItem('Estudio', item.study ? link(`https://www.ebi.ac.uk/ena/browser/view/${item.study}`, item.study) : '—')}
      ${detailItem('GEO', item.geo ? link(`https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=${item.geo}`, item.geo) : '—')}
      ${detailItem('ArrayExpress', item.arrayexpress ? link(`https://www.ebi.ac.uk/biostudies/arrayexpress/studies/${item.arrayexpress}`, item.arrayexpress) : '—')}
      ${detailItem('Nº de dianas', fmt(item.n_targets, 0))}
    </div>`;

  document.getElementById('detail-body').innerHTML = `${meta}<div class="subhead">Análisis</div>${analysis}${nt}${counts}${paper}`;
  dialog.showModal();
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

function nearGene(gene, margin = 0.8) {
  const thresholds = geneThresholds();
  return (gene.pct_t_below >= margin * thresholds.t && gene.pct_t_below < thresholds.t)
      || (gene.pct_t_above >= margin * thresholds.t && gene.pct_t_above < thresholds.t)
      || (gene.pct_n_below >= margin * thresholds.n && gene.pct_n_below < thresholds.n)
      || (gene.pct_n_above >= margin * thresholds.n && gene.pct_n_above < thresholds.n);
}

async function loadGenes() {
  state.geneSummary = state.summary.expression || {};
  const categories = ['T', 'N', 'NT', 'O'];
  const datasets = await Promise.all(categories.map(category =>
    getJson(`data/${state.cancer.id}/genes_${category}.json`)));
  state.genes = datasets.flatMap(data => rowsToObjects(data));

  fillSelect('gene-category', [['', 'Todas las categorías'],
    ...categories.map(category => [category, category])]);
  const types = [...new Set(state.genes.map(gene => gene.type))].sort();
  fillSelect('gene-type', [['', 'Todos los tipos'],
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
    `${state.cancer.label}: ${fmt(state.genes.length, 0)} genes clasificados (T ${fmt(counts.T || 0, 0)}, N ${fmt(counts.N || 0, 0)}, NT ${fmt(counts.NT || 0, 0)}, O ${fmt(counts.O || 0, 0)}).`;

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

function pctCell(value, threshold) {
  if (value === null || value === undefined) return '<td class="num">—</td>';
  const numeric = Number(value);
  let classes = '';
  if (numeric >= threshold) classes = 'pct-active';
  else if (numeric >= threshold * 0.8) classes = 'pct-near';
  return `<td class="num ${classes}">${pct(numeric)}</td>`;
}

function renderGenes() {
  const total = state.geneRows.length;
  const pages = Math.max(1, Math.ceil(total / state.genePageSize));
  state.genePage = Math.min(Math.max(1, state.genePage), pages);
  const start = (state.genePage - 1) * state.genePageSize;
  const slice = state.geneRows.slice(start, start + state.genePageSize);
  const thresholds = geneThresholds();
  const tbody = document.getElementById('gene-rows');

  if (!slice.length) {
    tbody.innerHTML = '<tr><td colspan="9"><p class="empty">No hay genes que coincidan.</p></td></tr>';
  } else {
    tbody.innerHTML = slice.map(gene => `<tr>
        <td><strong>${esc(gene.symbol)}</strong><div class="note mono">${esc(gene.ensembl)}</div></td>
        <td><span class="gene-type" title="${esc(gene.type)}">${esc(gene.type)}</span></td>
        <td>${categoryBadge(gene.category)}</td>
        <td class="num">${fmt(gene.log2fc, 3)}</td>
        ${pctCell(gene.pct_t_below, thresholds.t)}
        ${pctCell(gene.pct_t_above, thresholds.t)}
        ${pctCell(gene.pct_n_below, thresholds.n)}
        ${pctCell(gene.pct_n_above, thresholds.n)}
        <td><button class="btn" type="button" data-gene="${esc(gene.ensembl)}">Ver</button></td>
      </tr>`).join('');
  }

  document.getElementById('gene-page-info').textContent = total
    ? `Mostrando ${start + 1}–${Math.min(start + state.genePageSize, total)} de ${fmt(total, 0)} genes`
    : '0 genes';
  document.getElementById('gene-prev').disabled = state.genePage <= 1;
  document.getElementById('gene-next').disabled = state.genePage >= pages;
}

function openGene(gene) {
  const dialog = document.getElementById('gene-detail');
  const params = (state.geneSummary || {}).parametros || {};
  const thresholds = geneThresholds();
  document.getElementById('gene-detail-title').textContent = gene.symbol;
  document.getElementById('gene-detail-subtitle').textContent = `${gene.ensembl} · ${gene.type}`;

  const conditions = [
    ['T↓ (por debajo del mínimo normal)', gene.n_t_below, gene.pct_t_below, thresholds.t],
    ['T↑ (por encima del máximo normal)', gene.n_t_above, gene.pct_t_above, thresholds.t],
    ['N↓ (por debajo del mínimo tumoral)', gene.n_n_below, gene.pct_n_below, thresholds.n],
    ['N↑ (por encima del máximo tumoral)', gene.n_n_above, gene.pct_n_above, thresholds.n],
  ];
  const rows = conditions.map(([label, count, value, threshold]) => {
    const active = Number(value) >= threshold;
    const status = active
      ? '<span class="badge activado">activado</span>'
      : (Number(value) > 0 ? '<span class="badge sin_cambio">casi</span>' : '<span class="badge muted">—</span>');
    return `<tr><td>${esc(label)}</td><td class="num">${fmt(count, 0)}</td>
      <td class="num">${pct(value)}</td><td class="num">${pct(threshold)}</td><td>${status}</td></tr>`;
  }).join('');

  document.getElementById('gene-detail-body').innerHTML = `
    <div class="detail-grid">
      ${detailItem('Categoría', categoryBadge(gene.category))}
      ${detailItem('Tipo', esc(gene.type))}
      ${detailItem('log2FC T/N', fmt(gene.log2fc, 3))}
      ${detailItem('Media geométrica T', fmt(gene.geo_t, 3))}
      ${detailItem('Media geométrica N', fmt(gene.geo_n, 3))}
      ${detailItem('Mín. T / Máx. T', `${fmt(gene.t_min, 3)} / ${fmt(gene.t_max, 3)}`)}
      ${detailItem('Mín. N / Máx. N', `${fmt(gene.n_min, 3)} / ${fmt(gene.n_max, 3)}`)}
    </div>
    <div class="subhead">Muestras fuera del rango</div>
    <div class="table-wrap" style="box-shadow:none;border:0">
      <table>
        <thead><tr><th>Condición</th><th class="num">Muestras</th><th class="num">%</th><th class="num">Umbral</th><th>Estado</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <p class="note">Umbral efectivo T: ${pct(thresholds.t)} (${fmt(params.min_tumor_samples, 0)} de ${fmt(params.num_tumor, 0)} muestras).
    Umbral efectivo N: ${pct(thresholds.n)} (${fmt(params.min_normal_samples, 0)} de ${fmt(params.num_normal, 0)} muestras).</p>`;
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
      `<div class="card"><p class="note">Las publicaciones de ${esc(state.cancer.label)} todavía no están curadas. Los experimentos sí incluyen su análisis y su metadata.</p></div>`;
    document.getElementById('paper-page-info').textContent = '0 publicaciones';
    document.getElementById('paper-prev').disabled = true;
    document.getElementById('paper-next').disabled = true;
    document.getElementById('papers-lead').textContent =
      `${state.cancer.label}: publicaciones pendientes de curación.`;
    return;
  }
  const query = document.getElementById('paper-search').value.trim().toLowerCase();
  state.paperRows = state.papers.filter(paper => {
    if (!query) return true;
    const haystack = [paper.title, paper.authors, paper.journal, paper.summary, paper.pmid, paper.doi,
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
    list.innerHTML = '<p class="empty">No hay publicaciones que coincidan.</p>';
  } else {
    list.innerHTML = slice.map(paper => {
      const chips = (paper.experiments || []).slice(0, 8).map(name => `<span class="chip">${esc(name)}</span>`).join('');
      const extra = (paper.experiments || []).length > 8
        ? `<span class="chip">+${paper.experiments.length - 8} más</span>` : '';
      const links = [];
      if (paper.pmid) links.push(link(`https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}/`, `PMID ${paper.pmid}`));
      if (paper.doi) links.push(link(`https://doi.org/${paper.doi}`, `DOI ${paper.doi}`));
      return `<article class="card paper-card">
        <h3>${esc(paper.title || 'Sin título')}</h3>
        <div class="meta">${esc(paper.authors || '')}${paper.journal ? ` · ${esc(paper.journal)}` : ''}${paper.year ? ` (${paper.year})` : ''}</div>
        <div>${links.join(' · ')}</div>
        <div class="note">Fuente del enlace: ${esc(SOURCE_LABEL[paper.source] || paper.source || '—')}</div>
        ${paper.summary ? `<p style="margin:0">${esc(paper.summary)}</p>` : '<p class="note">Sin resumen.</p>'}
        <div class="chips">${chips}${extra}</div>
        <div class="note">${paper.n_experiments} experimento${paper.n_experiments === 1 ? '' : 's'} · ${(paper.studies || []).join(', ')}</div>
      </article>`;
    }).join('');
  }

  document.getElementById('paper-page-info').textContent = total
    ? `Mostrando ${start + 1}–${Math.min(start + state.paperPageSize, total)} de ${total}`
    : '0 publicaciones';
  document.getElementById('paper-prev').disabled = state.paperPage <= 1;
  document.getElementById('paper-next').disabled = state.paperPage >= pages;
  document.getElementById('papers-lead').textContent =
    `${state.cancer.label}: ${total} publicaciones identificadas. Cada ficha enlaza el artículo original y los experimentos que lo usan.`;
}

function fillMethodology() {
  document.title = `Metodología · ${state.cancer.label} · PerturbAtlas × TCGA`;
}

boot().catch(error => {
  console.error(error);
  document.querySelectorAll('main').forEach(main => {
    main.innerHTML = `<div class="card"><h2>No se pudieron cargar los datos</h2><p class="note">${esc(error.message)}</p></div>`;
  });
});
