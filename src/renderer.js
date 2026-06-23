const state = { all: [], filter: 'all', page: 0, premiumMode: null, premiumKeyword: '', publicLinks: {} };
const $ = id => document.getElementById(id);

function toast(message) {
  const old = document.querySelector('.toast'); if (old) old.remove();
  const el = document.createElement('div'); el.className = 'toast'; el.textContent = message; document.body.appendChild(el);
  setTimeout(() => el.remove(), 3300);
}

async function init() {
  const [tlds, appInfo] = await Promise.all([window.domainAPI.getTlds(), window.domainAPI.getAppInfo()]);
  state.publicLinks = appInfo.links;
  $('app-version').textContent = `v${appInfo.version}`;
  $('about-version').textContent = appInfo.version;
  $('tld-count').textContent = tlds.length;
  $('tld-picker').innerHTML = tlds.map(x => `<label class="chip"><input type="checkbox" value="${x.tld}" checked> .${x.tld}</label>`).join('');
}

document.querySelectorAll('.nav').forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('.nav').forEach(x => x.classList.remove('active')); btn.classList.add('active');
  document.querySelectorAll('.view').forEach(x => x.classList.remove('active-view')); $(`${btn.dataset.view}-view`).classList.add('active-view');
  const copy = {
    bulk: ['Find your name everywhere.', 'One word. Every worthwhile extension. No tab circus.'],
    premium: ['Find the name before it matters.', 'Brandability signals with conservative registration checks.'],
    help: ['Help, policies, and product details.', 'Everything you need to use Domain Scout AI with confidence.']
  }[btn.dataset.view];
  $('page-title').textContent = copy[0];
  $('page-copy').textContent = copy[1];
  $('results-section').classList.add('hidden');
}));

function setLoading(loading, note = 'This can take a moment.') {
  ['scan','premium-keyword','premium-random','next-page','prev-page'].forEach(id => { const el = $(id); if (el) el.disabled = loading; });
  $('progress-note').textContent = note; $('progress').classList.toggle('hidden', !loading); $('result-list').classList.toggle('hidden', loading);
}

function resetResultFilter() {
  state.filter = 'all';
  document.querySelectorAll('.filter').forEach(button => button.classList.toggle('active', button.dataset.filter === 'all'));
}

async function scanWord() {
  const word = $('word').value.trim(); if (!word) return toast('Enter a main domain word first.');
  const tlds = [...document.querySelectorAll('#tld-picker input:checked')].map(x => x.value);
  if (!tlds.length) return toast('Choose at least one extension.');
  resetResultFilter();
  $('results-section').classList.remove('hidden'); $('pagination').classList.add('hidden'); $('results-title').textContent = `Extensions for “${word}”`;
  setLoading(true, `Checking ${tlds.length} extensions.`);
  try { state.all = await window.domainAPI.scanWord(word, tlds); state.page = 0; render(); }
  catch (e) { toast(e.message || 'Search failed. Check your internet connection.'); }
  finally { setLoading(false); }
}

async function premiumSearch(mode, page = 0) {
  const keyword = $('keyword').value.trim();
  if (mode === 'keyword' && !keyword) return toast('Tell us a keyword or idea first.');
  state.premiumMode = mode; state.premiumKeyword = keyword; state.page = page;
  resetResultFilter();
  $('results-section').classList.remove('hidden'); $('pagination').classList.remove('hidden');
  $('results-title').textContent = mode === 'random' ? 'Random premium discoveries' : `Premium ideas for “${keyword}”`;
  $('page-number').textContent = page + 1; $('prev-page').disabled = page === 0;
  setLoading(true, 'Generating and checking up to 100 candidates.');
  try {
    state.all = await window.domainAPI.premiumSearch({ keyword, random: mode === 'random', page, count: 100 });
    render(); if (!state.all.length) toast('No confirmed available names on this page. Try the next 100.');
  } catch (e) { toast(e.message || 'Premium search failed.'); }
  finally { setLoading(false); }
}

function render() {
  let rows = state.all.filter(x => state.filter === 'all' || x.status === state.filter);
  const sort = $('sort').value;
  rows.sort(sort === 'name' ? (a,b) => a.domain.localeCompare(b.domain) : (a,b) => b.score-a.score);
  $('available-count').textContent = state.all.filter(x => x.status === 'likely_available').length;
  $('registered-count').textContent = state.all.filter(x => x.status === 'registered').length;
  $('empty').classList.toggle('hidden', rows.length > 0);
  $('result-list').innerHTML = rows.map(row => {
    const [label, ...ext] = row.domain.split('.');
    return `<article class="result-card">
      <div><div class="domain-name">${label}<span class="ext">.${ext.join('.')}</span></div><div class="domain-reason">${row.reason}</div></div>
      <div class="badge ${row.status}">${row.status === 'likely_available' ? 'likely available' : row.status}</div>
      <div class="price"><b>Price unknown</b><small>Check exact registrar price</small></div>
      <div class="score" title="${row.source} · ${row.confidence}"><div class="score-ring">${row.score}</div><span>BRAND<br>SCORE</span></div>
      <div class="buy-actions"><button class="buy" data-url="${row.links.namecheap}" ${row.status === 'registered' ? 'disabled' : ''}>Check Price &amp; Buy ↗</button></div>
    </article>`;
  }).join('');
}

$('scan').addEventListener('click', scanWord); $('word').addEventListener('keydown', e => { if (e.key === 'Enter') scanWord(); });
$('premium-keyword').addEventListener('click', () => premiumSearch('keyword', 0));
$('premium-random').addEventListener('click', () => premiumSearch('random', 0));
$('next-page').addEventListener('click', () => premiumSearch(state.premiumMode, state.page + 1));
$('prev-page').addEventListener('click', () => premiumSearch(state.premiumMode, Math.max(0, state.page - 1)));
document.querySelectorAll('.filter').forEach(btn => btn.addEventListener('click', () => { document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active')); btn.classList.add('active'); state.filter=btn.dataset.filter; render(); }));
$('sort').addEventListener('input', render);
$('result-list').addEventListener('click', e => { const btn=e.target.closest('[data-url]'); if(btn) window.domainAPI.openExternal(btn.dataset.url); });
document.body.addEventListener('click', e => {
  const button = e.target.closest('[data-public-link]');
  if (!button) return;
  const url = state.publicLinks[button.dataset.publicLink];
  if (url) window.domainAPI.openExternal(url).catch(() => toast('Could not open that link.'));
});
$('export').addEventListener('click', () => {
  if (!state.all.length) return toast('Nothing to export yet.');
  const csv = ['Domain,Status,Exact price,Brand score,Reason', ...state.all.map(x => `"${x.domain}",${x.status},"Not verified",${x.score},"${x.reason}"`)].join('\n');
  const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download='domain-scout-results.csv'; a.click(); URL.revokeObjectURL(a.href);
});

init().catch(() => toast('The app could not initialize.'));
