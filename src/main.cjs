const { app, BrowserWindow, ipcMain, shell, Menu, dialog } = require('electron');
const path = require('path');
const { TLDS, normalizeLabel, isValidLabel, estimatePrice, scoreDomain, scoreReason, makePremiumCandidates } = require('./domain-engine.cjs');
const { verifyDomain } = require('./availability.cjs');

const MAX_CONCURRENCY = 10;
const NAMECHEAP_AFFILIATE_BASE = 'https://namecheap.pxf.io/c/7430137/1632743/5618';
const PUBLIC_LINKS = Object.freeze({
  website: 'https://domainscout.vortixvpn.com/',
  support: 'https://domainscout.vortixvpn.com/support',
  privacy: 'https://domainscout.vortixvpn.com/privacy',
  terms: 'https://domainscout.vortixvpn.com/terms',
  affiliate: 'https://domainscout.vortixvpn.com/affiliate-disclosure',
  contact: 'mailto:contact@vortixvpn.com?subject=Domain%20Scout%20AI%20support'
});

function isAllowedExternalUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    if (url.protocol === 'https:' && ['namecheap.com', 'www.namecheap.com', 'namecheap.pxf.io', 'domainscout.vortixvpn.com'].includes(url.hostname)) return true;
    return url.protocol === 'mailto:' && url.pathname.toLowerCase() === 'contact@vortixvpn.com';
  } catch { return false; }
}

function openTrustedUrl(url) {
  if (!isAllowedExternalUrl(url)) throw new Error('Blocked unsafe link.');
  return shell.openExternal(url);
}

function createApplicationMenu() {
  const template = [
    { label: 'File', submenu: [{ label: 'Exit', accelerator: 'Alt+F4', role: 'quit' }] },
    { label: 'View', submenu: [
      { label: 'Reload', accelerator: 'Ctrl+R', role: 'reload' },
      { type: 'separator' },
      { label: 'Actual Size', accelerator: 'Ctrl+0', role: 'resetZoom' },
      { label: 'Zoom In', accelerator: 'Ctrl+Plus', role: 'zoomIn' },
      { label: 'Zoom Out', accelerator: 'Ctrl+-', role: 'zoomOut' },
      { type: 'separator' },
      { label: 'Toggle Full Screen', accelerator: 'F11', role: 'togglefullscreen' }
    ] },
    { label: 'Help', submenu: [
      { label: 'Help & Support', click: () => openTrustedUrl(PUBLIC_LINKS.support) },
      { label: 'Visit Domain Scout Website', click: () => openTrustedUrl(PUBLIC_LINKS.website) },
      { label: 'Contact Us', click: () => openTrustedUrl(PUBLIC_LINKS.contact) },
      { type: 'separator' },
      { label: 'Privacy Policy', click: () => openTrustedUrl(PUBLIC_LINKS.privacy) },
      { label: 'Terms of Use', click: () => openTrustedUrl(PUBLIC_LINKS.terms) },
      { label: 'Affiliate Disclosure', click: () => openTrustedUrl(PUBLIC_LINKS.affiliate) },
      { type: 'separator' },
      { label: 'About Domain Scout AI', click: () => dialog.showMessageBox({
        type: 'info', title: 'About Domain Scout AI',
        message: `Domain Scout AI ${app.getVersion()}`,
        detail: 'Domain discovery for Windows.\n\nWebsite: domainscout.vortixvpn.com\nContact: contact@vortixvpn.com',
        buttons: ['OK'], noLink: true
      }) }
    ] }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

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
  createApplicationMenu();
  ipcMain.handle('get-tlds', () => TLDS);
  ipcMain.handle('get-app-info', () => ({ version: app.getVersion(), links: PUBLIC_LINKS }));
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
    return openTrustedUrl(url);
  });
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
