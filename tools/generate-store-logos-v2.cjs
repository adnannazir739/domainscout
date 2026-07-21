const fs = require('fs');
const path = require('path');

const outDir = path.resolve(__dirname, '..', 'store-assets', 'logos');
fs.mkdirSync(outDir, { recursive: true });

function commonDefs() {
  return `
  <defs>
    <radialGradient id="bg" cx="62%" cy="20%" r="92%">
      <stop offset="0%" stop-color="#1e3a2a"/>
      <stop offset="46%" stop-color="#07110f"/>
      <stop offset="100%" stop-color="#020504"/>
    </radialGradient>
    <linearGradient id="lime" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#e4ff7a"/>
      <stop offset="1" stop-color="#63e6a4"/>
    </linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#12261f" stop-opacity="0.96"/>
      <stop offset="1" stop-color="#06100d" stop-opacity="0.98"/>
    </linearGradient>
    <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="26" stdDeviation="36" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
    <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>`;
}

function network(width, height, scale = 1) {
  const nodes = [
    [0.22, 0.28], [0.38, 0.20], [0.58, 0.26], [0.76, 0.18],
    [0.26, 0.48], [0.50, 0.44], [0.72, 0.52], [0.40, 0.66], [0.66, 0.72]
  ];
  const lines = [[0,1],[1,2],[2,3],[0,4],[4,5],[5,6],[5,7],[6,8],[7,8],[2,5]];
  return `
  <g opacity="0.38">
    ${lines.map(([a,b]) => `<line x1="${nodes[a][0]*width}" y1="${nodes[a][1]*height}" x2="${nodes[b][0]*width}" y2="${nodes[b][1]*height}" stroke="#7cffac" stroke-width="${2*scale}" opacity="0.45"/>`).join('')}
    ${nodes.map(([x,y], i) => `<circle cx="${x*width}" cy="${y*height}" r="${(i % 3 === 0 ? 7 : 5)*scale}" fill="${i % 2 ? '#c8ff61' : '#63e6a4'}" opacity="0.9"/>`).join('')}
  </g>`;
}

function chips(chips, x, y, gap, fontSize) {
  let currentX = x;
  return `<g>${chips.map(chip => {
    const width = chip.length * fontSize * 0.7 + 34;
    const output = `<rect x="${currentX}" y="${y}" width="${width}" height="${fontSize * 1.8}" rx="${fontSize * 0.9}" fill="#14251f" stroke="#315344" stroke-width="2"/>
      <text x="${currentX + width / 2}" y="${y + fontSize * 1.2}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="${fontSize}" font-weight="800" fill="#c8ff61">${chip}</text>`;
    currentX += width + gap;
    return output;
  }).join('')}</g>`;
}

function squareSvg() {
  const width = 1080;
  const height = 1080;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  ${commonDefs()}
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <circle cx="820" cy="120" r="360" fill="#c8ff61" opacity="0.07"/>
  <circle cx="140" cy="920" r="280" fill="#63e6a4" opacity="0.08"/>
  ${network(width, height, 1.15)}
  <g filter="url(#softShadow)">
    <circle cx="540" cy="405" r="230" fill="url(#glass)" stroke="#325948" stroke-width="6"/>
    <circle cx="540" cy="405" r="174" fill="none" stroke="#c8ff61" stroke-width="17" opacity="0.95"/>
    <line x1="674" y1="548" x2="790" y2="664" stroke="#c8ff61" stroke-width="34" stroke-linecap="round"/>
    <line x1="674" y1="548" x2="790" y2="664" stroke="#63e6a4" stroke-width="13" stroke-linecap="round" opacity="0.85"/>
    <text x="540" y="374" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="70" font-weight="900" fill="#f1f6ef">www</text>
    <text x="540" y="452" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="88" font-weight="900" fill="url(#lime)">.AI</text>
    ${chips(['.com','.io','.xyz'], 344, 498, 14, 27)}
  </g>
</svg>`;
}

function posterSvg() {
  const width = 720;
  const height = 1080;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  ${commonDefs()}
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <circle cx="580" cy="130" r="330" fill="#c8ff61" opacity="0.07"/>
  <circle cx="95" cy="910" r="240" fill="#63e6a4" opacity="0.075"/>
  ${network(width, height, 0.9)}
  <g filter="url(#softShadow)">
    <rect x="72" y="175" width="576" height="710" rx="64" fill="url(#glass)" stroke="#325948" stroke-width="5"/>
    <circle cx="360" cy="428" r="174" fill="none" stroke="#c8ff61" stroke-width="15"/>
    <line x1="462" y1="538" x2="558" y2="634" stroke="#c8ff61" stroke-width="28" stroke-linecap="round"/>
    <line x1="462" y1="538" x2="558" y2="634" stroke="#63e6a4" stroke-width="11" stroke-linecap="round" opacity="0.85"/>
    <text x="360" y="402" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="58" font-weight="900" fill="#f1f6ef">www</text>
    <text x="360" y="472" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="78" font-weight="900" fill="url(#lime)">.AI</text>
    ${chips(['.com','.io'], 214, 528, 14, 26)}
    <text x="360" y="720" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="58" font-weight="900" fill="#f1f6ef" letter-spacing="-2">Domain Scout AI</text>
    <text x="360" y="770" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="24" font-weight="800" fill="#c8ff61" letter-spacing="4">FIND BETTER DOMAINS</text>
  </g>
  <text x="360" y="965" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="28" font-weight="700" fill="#9bb4ac">Bulk search - AI ideas - Brand scores</text>
</svg>`;
}

fs.writeFileSync(path.join(outDir, 'domain-scout-ai-box-art-1080-v2.svg'), squareSvg());
fs.writeFileSync(path.join(outDir, 'domain-scout-ai-poster-art-720x1080-v2.svg'), posterSvg());
