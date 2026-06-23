const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { TLDS, normalizeLabel, isValidLabel, estimatePrice, scoreDomain, scoreReason, makePremiumCandidates } = require('./domain-engine.cjs');
const { verifyDomain } = require('./availability.cjs');

const MAX_CONCURRENCY = 10;
const NAMECHEAP_AFFILIATE_BASE = 'https://namecheap.pxf.io/c/7430137/1632743/5618';

function createWindow() {
  const win = new BrowserWindow({
    width: 1440, height: 900, minWidth: 1050, minHeight: 680,
    backgroundColor: '#07110f',
    titleBarStyle: 'hiddenInset',
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false }
  });
  win.loadFile(path.join(__dirname, 'index.html'));
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  async function run() {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

async function checkDomain(item) {
  const domain = typeof item === 'string' ? item : item.domain;
  const [label, ...rest] = domain.split('.');
  const tld = rest.join('.');
  const verification = await verifyDomain(domain);
  const baselinePrice = estimatePrice(tld);
  const namecheapDestination = `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(domain)}`;
  return {
    domain, label, tld, status: verification.status,
    price: null, priceVerified: false, baselinePrice,
    priceKind: 'Exact price not verified',
    source: verification.source, confidence: verification.confidence,
    score: scoreDomain(label, tld), reason: scoreReason(label, tld),
    links: {
      namecheap: `${NAMECHEAP_AFFILIATE_BASE}?u=${encodeURIComponent(namecheapDestination)}`
    }
  };
}

app.whenReady().then(() => {
  ipcMain.handle('get-tlds', () => TLDS);
  ipcMain.handle('scan-word', async (_event, word, selectedTlds) => {
    const label = normalizeLabel(word);
    if (!isValidLabel(label)) throw new Error('Enter a valid domain word (letters, numbers, or hyphens).');
    const tlds = Array.isArray(selectedTlds) && selectedTlds.length ? selectedTlds : TLDS.map(x => x.tld);
    return mapLimit(tlds.map(tld => ({ domain: `${label}.${tld}` })), MAX_CONCURRENCY, checkDomain);
  });
  ipcMain.handle('premium-search', async (_event, options) => {
    const candidates = makePremiumCandidates(options || {});
    const checked = await mapLimit(candidates, MAX_CONCURRENCY, checkDomain);
    // Keep unverified country-code domains visible; never label them available.
    return checked.filter(x => x.status !== 'registered');
  });
  ipcMain.handle('open-external', (_event, url) => {
    if (/^https:\/\/(www\.)?namecheap\.com\//i.test(url) || /^https:\/\/namecheap\.pxf\.io\//i.test(url)) return shell.openExternal(url);
    throw new Error('Blocked unsafe link.');
  });
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
