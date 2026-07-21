const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const outDir = path.resolve(__dirname, '..', 'store-assets', 'logos');

const allJobs = [
  {
    svg: 'domain-scout-ai-poster-art-720x1080.svg',
    png: 'domain-scout-ai-poster-art-720x1080.png',
    html: 'poster.html',
    width: 720,
    height: 1080
  },
  {
    svg: 'domain-scout-ai-box-art-1080.svg',
    png: 'domain-scout-ai-box-art-1080.png',
    html: 'box.html',
    width: 1080,
    height: 1080
  }
];
const requested = process.argv[2];
const jobs = requested ? allJobs.filter(job => job.png.includes(requested) || job.svg.includes(requested)) : allJobs;

async function render(job) {
  const win = new BrowserWindow({
    width: job.width,
    height: job.height,
    show: false,
    frame: false,
    transparent: false,
    backgroundColor: '#07110f',
    webPreferences: { offscreen: true }
  });
  const svg = fs.readFileSync(path.join(outDir, job.svg), 'utf8').replace(/<\?xml[^>]*>\s*/i, '');
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;width:${job.width}px;height:${job.height}px;overflow:hidden;background:#07110f}svg{display:block;width:${job.width}px;height:${job.height}px}</style></head><body>${svg}</body></html>`;
  const tempHtml = path.join(outDir, job.html);
  fs.writeFileSync(tempHtml, html, 'utf8');
  await win.loadURL(pathToFileURL(tempHtml).href);
  await new Promise(resolve => setTimeout(resolve, 350));
  const image = await win.capturePage();
  fs.writeFileSync(path.join(outDir, job.png), image.resize({ width: job.width, height: job.height }).toPNG());
  win.destroy();
}

app.whenReady().then(async () => {
  for (const job of jobs) await render(job);
  app.quit();
}).catch(error => {
  console.error(error);
  app.exit(1);
});
