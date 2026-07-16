const { app, BrowserWindow, ipcMain, shell, Menu, dialog } = require('electron');
const https = require('https');
const path = require('path');
const { TLDS, normalizeLabel, isValidLabel, estimatePrice, scoreDomain, scoreReason, makePremiumCandidates } = require('./domain-engine.cjs');
const { verifyDomain } = require('./availability.cjs');

const MAX_CONCURRENCY = 10;
const NAMECHEAP_AFFILIATE_BASE = 'https://namecheap.pxf.io/c/7430137/1632743/5618';
const UPDATE_MANIFEST_URL = 'https://domainscout.vortixvpn.com/version.json';
const AFFILIATE_ADS_URL = 'https://domainscout.vortixvpn.com/ads.json';
const PUBLIC_LINKS = Object.freeze({
  website: 'https://domainscout.vortixvpn.com/',
  support: 'https://domainscout.vortixvpn.com/support',
  updates: 'https://domainscout.vortixvpn.com/support#updates',
  privacy: 'https://domainscout.vortixvpn.com/privacy',
  terms: 'https://domainscout.vortixvpn.com/terms',
  affiliate: 'https://domainscout.vortixvpn.com/affiliate-disclosure',
  contact: 'mailto:contact@vortixvpn.com?subject=Domain%20Scout%20AI%20support'
});

const FALLBACK_AFFILIATE_ADS = Object.freeze({
  enabled: true,
  ads: [
    {
      slot: 'sidebar',
      label: 'Affiliate partner',
      title: 'Need a domain today?',
      text: 'Check exact prices and register securely with Namecheap.',
      button: 'Check Price',
      url: NAMECHEAP_AFFILIATE_BASE
    },
    {
      slot: 'top',
      label: 'Affiliate partner',
      title: 'Found a good name? Secure it before someone else does.',
      text: 'Domain Scout AI may earn a commission when you buy through our Namecheap partner link.',
      button: 'Search on Namecheap',
      url: NAMECHEAP_AFFILIATE_BASE
    },
    {
      slot: 'bulk',
      label: 'Affiliate partner',
      title: 'Compare your final picks at checkout',
      text: 'Use Namecheap to confirm exact domain pricing, premium fees, and availability before buying.',
      button: 'Open Namecheap',
      url: NAMECHEAP_AFFILIATE_BASE
    },
    {
      slot: 'premium',
      label: 'Affiliate partner',
      title: 'Premium idea? Check the real price.',
      text: 'Brand score is only a signal. Always confirm the final registrar price before purchase.',
      button: 'Check Price',
      url: NAMECHEAP_AFFILIATE_BASE
    },
    {
      slot: 'help',
      label: 'Affiliate disclosure',
      title: 'How Domain Scout AI stays free',
      text: 'Registrar links may be affiliate links. You pay the same price; we may earn a commission.',
      button: 'Read disclosure',
      url: PUBLIC_LINKS.affiliate
    }
  ]
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

function compareVersions(a, b) {
  const left = String(a || '').split('.').map(part => Number.parseInt(part, 10) || 0);
  const right = String(b || '').split('.').map(part => Number.parseInt(part, 10) || 0);
  const length = Math.max(left.length, right.length);
  for (let i = 0; i < length; i++) {
    if ((left[i] || 0) > (right[i] || 0)) return 1;
    if ((left[i] || 0) < (right[i] || 0)) return -1;
  }
  return 0;
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { headers: { 'User-Agent': `DomainScoutAI/${app.getVersion()}` } }, response => {
      if (response.statusCode < 200 || response.statusCode >= 300) {
        response.resume();
        reject(new Error(`Update server returned ${response.statusCode}`));
        return;
      }
      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => { body += chunk; });
      response.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch { reject(new Error('Update information could not be read.')); }
      });
    });
    request.setTimeout(8000, () => {
      request.destroy(new Error('Update check timed out.'));
    });
    request.on('error', reject);
  });
}

async function checkForUpdates() {
  const currentVersion = app.getVersion();
  const manifest = await fetchJson(UPDATE_MANIFEST_URL);
  const latestVersion = String(manifest.latestVersion || manifest.version || '').trim();
  if (!latestVersion) throw new Error('Update information is missing the latest version.');
  const updateUrl = manifest.updateUrl || PUBLIC_LINKS.updates;
  return {
    currentVersion,
    latestVersion,
    updateAvailable: compareVersions(latestVersion, currentVersion) > 0,
    title: manifest.title || 'Domain Scout AI update',
    notes: manifest.notes || '',
    updateUrl,
    checkedAt: new Date().toISOString()
  };
}

function normalizeAffiliateAds(manifest) {
  const source = manifest && typeof manifest === 'object' ? manifest : FALLBACK_AFFILIATE_ADS;
  if (source.enabled === false) return { enabled: false, ads: [] };
  const allowedSlots = new Set(['sidebar', 'top', 'bulk', 'premium', 'help']);
  const ads = Array.isArray(source.ads) ? source.ads : [];
  return {
    enabled: true,
    ads: ads.filter(ad => ad && allowedSlots.has(ad.slot) && isAllowedExternalUrl(ad.url)).map(ad => ({
      slot: ad.slot,
      label: String(ad.label || 'Affiliate partner').slice(0, 40),
      title: String(ad.title || '').slice(0, 90),
      text: String(ad.text || '').slice(0, 180),
      button: String(ad.button || 'Learn more').slice(0, 32),
      url: ad.url
    }))
  };
}

async function getAffiliateAds() {
  try {
    const manifest = await fetchJson(AFFILIATE_ADS_URL);
    const normalized = normalizeAffiliateAds(manifest);
    return normalized.ads.length || normalized.enabled === false ? normalized : FALLBACK_AFFILIATE_ADS;
  } catch {
    return FALLBACK_AFFILIATE_ADS;
  }
}

async function showUpdateDialog() {
  try {
    const update = await checkForUpdates();
    if (!update.updateAvailable) {
      await dialog.showMessageBox({
        type: 'info',
        title: 'Domain Scout AI is up to date',
        message: `You are using the latest version: ${update.currentVersion}`,
        buttons: ['OK'],
        noLink: true
      });
      return;
    }
    const { response } = await dialog.showMessageBox({
      type: 'info',
      title: 'Update available',
      message: `Domain Scout AI ${update.latestVersion} is available.`,
      detail: `Current version: ${update.currentVersion}\n\n${update.notes || 'Open the official update page to get the latest version.'}`,
      buttons: ['Update now', 'Later'],
      defaultId: 0,
      cancelId: 1,
      noLink: true
    });
    if (response === 0) await openTrustedUrl(update.updateUrl);
  } catch (error) {
    await dialog.showMessageBox({
      type: 'warning',
      title: 'Could not check for updates',
      message: error.message || 'Update check failed. Please try again later.',
      buttons: ['OK'],
      noLink: true
    });
  }
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
      { label: 'Check for Updates', click: () => showUpdateDialog() },
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
  ipcMain.handle('check-for-updates', () => checkForUpdates());
  ipcMain.handle('get-affiliate-ads', () => getAffiliateAds());
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
