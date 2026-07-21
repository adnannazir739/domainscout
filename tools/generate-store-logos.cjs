const fs = require('fs');
const path = require('path');

const outDir = path.resolve(__dirname, '..', 'store-assets', 'logos');
fs.mkdirSync(outDir, { recursive: true });

function svgLogo({ width, height, poster = false }) {
  const cardX = poster ? 70 : 92;
  const cardY = poster ? 240 : 130;
  const cardW = width - cardX * 2;
  const iconSize = poster ? 230 : 300;
  const iconX = (width - iconSize) / 2;
  const iconY = poster ? 350 : 250;
  const titleY = poster ? 675 : 635;
  const subY = titleY + (poster ? 58 : 72);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="50%" cy="20%" r="80%">
      <stop offset="0%" stop-color="#22442f"/>
      <stop offset="55%" stop-color="#07110f"/>
      <stop offset="100%" stop-color="#030807"/>
    </radialGradient>
    <linearGradient id="card" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#13231e"/>
      <stop offset="1" stop-color="#0b1714"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="28" stdDeviation="35" flood-color="#000000" flood-opacity="0.45"/>
    </filter>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#glow)"/>
  <circle cx="${width * 0.74}" cy="${height * 0.18}" r="${poster ? 420 : 330}" fill="#c8ff61" opacity="0.06"/>
  <circle cx="${width * 0.2}" cy="${height * 0.82}" r="${poster ? 330 : 250}" fill="#63e6a4" opacity="0.055"/>
  <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${poster ? 690 : 790}" rx="58" fill="url(#card)" stroke="#244238" stroke-width="4" filter="url(#shadow)"/>
  <rect x="${iconX}" y="${iconY}" width="${iconSize}" height="${iconSize}" rx="78" fill="#c8ff61"/>
  <text x="${width / 2}" y="${iconY + iconSize * 0.68}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="${poster ? 145 : 185}" font-weight="900" fill="#07110f">D</text>
  <text x="${width / 2}" y="${titleY}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="${poster ? 54 : 72}" font-weight="800" fill="#f1f6ef" letter-spacing="-2">Domain Scout</text>
  <text x="${width / 2}" y="${subY}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="${poster ? 24 : 31}" font-weight="800" fill="#c8ff61" letter-spacing="${poster ? 6 : 11}">AI DOMAIN DISCOVERY</text>
  ${poster ? `<text x="${width / 2}" y="835" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="24" font-weight="500" fill="#8ca39b">Bulk search - AI ideas - Brand scores</text>` : ''}
</svg>`;
}

fs.writeFileSync(path.join(outDir, 'domain-scout-ai-box-art-1080.svg'), svgLogo({ width: 1080, height: 1080 }));
fs.writeFileSync(path.join(outDir, 'domain-scout-ai-poster-art-720x1080.svg'), svgLogo({ width: 720, height: 1080, poster: true }));
