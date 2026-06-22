const TLDS = [
  { tld: 'com', price: 14.99, weight: 20 }, { tld: 'ai', price: 79.99, weight: 18 },
  { tld: 'io', price: 44.99, weight: 17 }, { tld: 'co', price: 29.99, weight: 15 },
  { tld: 'net', price: 14.99, weight: 13 }, { tld: 'org', price: 12.99, weight: 12 },
  { tld: 'xyz', price: 11.99, weight: 11 }, { tld: 'app', price: 19.99, weight: 13 },
  { tld: 'dev', price: 16.99, weight: 13 }, { tld: 'tech', price: 39.99, weight: 11 },
  { tld: 'me', price: 19.99, weight: 10 }, { tld: 'cloud', price: 24.99, weight: 10 },
  { tld: 'design', price: 39.99, weight: 9 }, { tld: 'store', price: 34.99, weight: 9 },
  { tld: 'shop', price: 29.99, weight: 9 }, { tld: 'online', price: 34.99, weight: 8 },
  { tld: 'site', price: 24.99, weight: 8 }, { tld: 'digital', price: 39.99, weight: 9 },
  { tld: 'agency', price: 29.99, weight: 9 }, { tld: 'studio', price: 34.99, weight: 9 },
  { tld: 'finance', price: 59.99, weight: 9 }, { tld: 'capital', price: 49.99, weight: 9 },
  { tld: 'ventures', price: 49.99, weight: 8 }, { tld: 'systems', price: 29.99, weight: 9 },
  { tld: 'solutions', price: 29.99, weight: 8 }, { tld: 'network', price: 24.99, weight: 8 },
  { tld: 'world', price: 24.99, weight: 8 }, { tld: 'live', price: 24.99, weight: 8 },
  { tld: 'space', price: 19.99, weight: 8 }, { tld: 'today', price: 19.99, weight: 7 },
  { tld: 'news', price: 29.99, weight: 8 }, { tld: 'media', price: 34.99, weight: 9 },
  { tld: 'tv', price: 34.99, weight: 10 }, { tld: 'gg', price: 59.99, weight: 10 },
  { tld: 'us', price: 11.99, weight: 8 }, { tld: 'de', price: 9.99, weight: 9 },
  { tld: 'in', price: 11.99, weight: 9 }, { tld: 'pk', price: 34.99, weight: 7 },
  { tld: 'uk', price: 10.99, weight: 9 }, { tld: 'ca', price: 14.99, weight: 9 },
  { tld: 'eu', price: 11.99, weight: 8 }, { tld: 'au', price: 13.99, weight: 8 },
  { tld: 'co.uk', price: 10.99, weight: 10 }, { tld: 'co.in', price: 10.99, weight: 8 },
  { tld: 'info', price: 24.99, weight: 7 }, { tld: 'biz', price: 19.99, weight: 6 },
  { tld: 'pro', price: 19.99, weight: 7 }, { tld: 'one', price: 14.99, weight: 7 },
  { tld: 'link', price: 14.99, weight: 7 }, { tld: 'works', price: 29.99, weight: 7 }
];

const PREFIXES = ['get', 'try', 'use', 'join', 'my', 'hey', 'go', 'we', 'open', 'true', 'neo', 'nova', 'next', 'bright', 'super', 'smart'];
const SUFFIXES = ['ly', 'hub', 'lab', 'labs', 'base', 'flow', 'grid', 'nest', 'pilot', 'stack', 'spark', 'forge', 'wise', 'wave', 'works', 'box', 'hq', 'ai'];
const PREMIUM_ROOTS = ['aura', 'atlas', 'axiom', 'bloom', 'bolt', 'cinder', 'cobalt', 'comet', 'echo', 'ember', 'flux', 'glint', 'halo', 'haven', 'helix', 'kairo', 'lumen', 'mint', 'nexa', 'nova', 'orbit', 'pixel', 'prism', 'pulse', 'quill', 'rally', 'roam', 'sage', 'shift', 'solar', 'sonic', 'spark', 'summit', 'swift', 'terra', 'vanta', 'vault', 'vector', 'velvet', 'vertex', 'vivid', 'wave', 'zenith'];

function normalizeLabel(input) {
  return String(input || '').trim().toLowerCase().replace(/^https?:\/\//, '').split('.')[0]
    .replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '').slice(0, 63);
}

function isValidLabel(label) {
  return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label);
}

function estimatePrice(tld) {
  return TLDS.find(x => x.tld === tld)?.price ?? 24.99;
}

function scoreDomain(label, tld) {
  let score = 46 + (TLDS.find(x => x.tld === tld)?.weight || 6);
  const len = label.length;
  if (len <= 5) score += 19; else if (len <= 8) score += 14; else if (len <= 11) score += 7; else score -= Math.min(15, len - 11);
  if (!label.includes('-')) score += 6;
  if (!/\d/.test(label)) score += 5;
  if (/^[a-z]+$/.test(label)) score += 3;
  if (/(.)\1\1/.test(label)) score -= 8;
  const vowels = (label.match(/[aeiou]/g) || []).length;
  if (vowels > 0 && vowels / len >= .2 && vowels / len <= .6) score += 5;
  return Math.max(1, Math.min(99, Math.round(score)));
}

function scoreReason(label, tld) {
  const reasons = [];
  if (label.length <= 8) reasons.push('short');
  if (!label.includes('-') && !/\d/.test(label)) reasons.push('clean');
  if (['com', 'ai', 'io', 'co', 'app'].includes(tld)) reasons.push(`strong .${tld} fit`);
  reasons.push('easy to brand');
  return reasons.slice(0, 3).join(' · ');
}

function makeKeywordLabels(keyword) {
  const root = normalizeLabel(keyword);
  if (!root) return [];
  const candidates = [root];
  PREFIXES.forEach(x => candidates.push(`${x}${root}`));
  SUFFIXES.forEach(x => candidates.push(`${root}${x}`));
  return [...new Set(candidates)].filter(isValidLabel);
}

function makePremiumCandidates({ keyword = '', random = false, page = 0, count = 100 } = {}) {
  let labels = random ? PREMIUM_ROOTS.slice() : makeKeywordLabels(keyword);
  if (!labels.length) labels = PREMIUM_ROOTS.slice();
  const seed = page * count;
  const expanded = [];
  for (let i = 0; expanded.length < count * 3; i++) {
    const root = labels[(i + seed) % labels.length];
    const cycle = Math.floor((i + seed) / labels.length);
    let label = root;
    if (cycle > 0) {
      const addon = cycle % 2 ? SUFFIXES[(cycle + i) % SUFFIXES.length] : PREFIXES[(cycle + i) % PREFIXES.length];
      label = cycle % 2 ? `${root}${addon}` : `${addon}${root}`;
    }
    if (isValidLabel(label)) {
      const tld = TLDS[(i * 7 + page * 3) % TLDS.length].tld;
      const domain = `${label}.${tld}`;
      if (!expanded.some(x => x.domain === domain)) expanded.push({ label, tld, domain });
    }
  }
  // Select before sorting so lower-weight country TLDs are not removed from the candidate set.
  return expanded.slice(0, count).sort((a, b) => scoreDomain(b.label, b.tld) - scoreDomain(a.label, a.tld));
}

module.exports = { TLDS, normalizeLabel, isValidLabel, estimatePrice, scoreDomain, scoreReason, makePremiumCandidates };
