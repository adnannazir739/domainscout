const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'store-assets', 'screenshots');
const packageVersion = require(path.join(root, 'package.json')).version;

const sampleTlds = [
  { tld: 'com' }, { tld: 'net' }, { tld: 'org' }, { tld: 'io' }, { tld: 'ai' }, { tld: 'xyz' },
  { tld: 'us' }, { tld: 'de' }, { tld: 'in' }, { tld: 'pk' }, { tld: 'co' }, { tld: 'app' },
  { tld: 'shop' }, { tld: 'online' }, { tld: 'tech' }, { tld: 'site' }
];

const sampleRows = [
  { domain: 'sigmaflow.ai', status: 'likely_available', source: 'Registry RDAP', confidence: 'high', score: 94, reason: 'Short, modern, and brandable', links: { namecheap: 'https://namecheap.pxf.io/c/7430137/1632743/5618' } },
  { domain: 'sigmalabs.io', status: 'likely_available', source: 'Registry RDAP', confidence: 'high', score: 91, reason: 'Strong startup-style extension fit', links: { namecheap: 'https://namecheap.pxf.io/c/7430137/1632743/5618' } },
  { domain: 'sigma.xyz', status: 'registered', source: 'Registry RDAP', confidence: 'high', score: 82, reason: 'Clean but already registered', links: { namecheap: 'https://namecheap.pxf.io/c/7430137/1632743/5618' } },
  { domain: 'trysigma.app', status: 'likely_available', source: 'Registry RDAP', confidence: 'medium', score: 80, reason: 'Actionable app-style name', links: { namecheap: 'https://namecheap.pxf.io/c/7430137/1632743/5618' } },
  { domain: 'sigma.us', status: 'unknown', source: 'Registry check unavailable', confidence: 'low', score: 77, reason: 'Country extension requires registrar confirmation', links: { namecheap: 'https://namecheap.pxf.io/c/7430137/1632743/5618' } }
];

const premiumRows = [
  { domain: 'technova.ai', status: 'likely_available', source: 'Registry RDAP', confidence: 'high', score: 96, reason: 'Future-facing technology brand', links: { namecheap: 'https://namecheap.pxf.io/c/7430137/1632743/5618' } },
  { domain: 'buildloop.io', status: 'likely_available', source: 'Registry RDAP', confidence: 'high', score: 92, reason: 'Short SaaS-friendly compound', links: { namecheap: 'https://namecheap.pxf.io/c/7430137/1632743/5618' } },
  { domain: 'cloudmint.xyz', status: 'likely_available', source: 'Registry RDAP', confidence: 'medium', score: 88, reason: 'Memorable modern brand signal', links: { namecheap: 'https://namecheap.pxf.io/c/7430137/1632743/5618' } }
];

const ads = {
  enabled: true,
  ads: [
    {
      slot: 'sidebar',
      label: 'Affiliate partner',
      title: 'Need a domain today?',
      text: 'Check exact prices and register securely with Namecheap.',
      button: 'Check Price',
      url: 'https://namecheap.pxf.io/c/7430137/1632743/5618'
    }
  ]
};

function registerIpc() {
  ipcMain.handle('get-tlds', () => sampleTlds);
  ipcMain.handle('get-app-info', () => ({
    version: packageVersion,
    links: {
      website: 'https://domainscout.vortixvpn.com/',
      support: 'https://domainscout.vortixvpn.com/support',
      updates: 'https://domainscout.vortixvpn.com/support#updates',
      privacy: 'https://domainscout.vortixvpn.com/privacy',
      terms: 'https://domainscout.vortixvpn.com/terms',
      affiliate: 'https://domainscout.vortixvpn.com/affiliate-disclosure',
      contact: 'mailto:contact@vortixvpn.com?subject=Domain%20Scout%20AI%20support'
    }
  }));
  ipcMain.handle('get-affiliate-ads', () => ads);
  ipcMain.handle('check-for-updates', () => ({ currentVersion: packageVersion, latestVersion: packageVersion, updateAvailable: false }));
  ipcMain.handle('scan-word', () => sampleRows);
  ipcMain.handle('premium-search', () => premiumRows);
  ipcMain.handle('open-external', () => true);
}

async function wait(ms = 300) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

async function capture(win, name) {
  await wait(500);
  const image = await win.capturePage();
  const fs = require('fs');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, name), image.toPNG());
}

async function run() {
  registerIpc();
  await app.whenReady();

  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    show: false,
    backgroundColor: '#07110f',
    webPreferences: {
      preload: path.join(root, 'src', 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  await win.loadFile(path.join(root, 'src', 'index.html'));
  await wait(1000);
  await capture(win, '01-bulk-domain-search.png');

  await win.webContents.executeJavaScript(`
    document.getElementById('word').value = 'sigma';
    document.getElementById('scan').click();
  `);
  await wait(900);
  await capture(win, '02-domain-results.png');

  await win.webContents.executeJavaScript(`
    document.querySelector('[data-view="premium"]').click();
    document.getElementById('keyword').value = 'tech';
    document.getElementById('premium-keyword').click();
  `);
  await wait(900);
  await capture(win, '03-ai-premium-search.png');

  await win.webContents.executeJavaScript(`document.querySelector('[data-view="help"]').click();`);
  await wait(700);
  await capture(win, '04-help-and-legal.png');

  win.destroy();
  app.quit();
}

run().catch(error => {
  console.error(error);
  app.exit(1);
});
