const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeLabel, isValidLabel, scoreDomain, makePremiumCandidates } = require('../src/domain-engine.cjs');

test('normalizes a pasted domain or URL to its main label', () => {
  assert.equal(normalizeLabel('https://Sigma.IO'), 'sigma');
  assert.equal(normalizeLabel('  Bright Labs!  '), 'brightlabs');
});

test('validates DNS labels', () => {
  assert.equal(isValidLabel('sigma'), true);
  assert.equal(isValidLabel('-sigma'), false);
  assert.equal(isValidLabel(''), false);
});

test('short clean domains score better than long hyphenated ones', () => {
  assert.ok(scoreDomain('nova', 'com') > scoreDomain('very-long-domain-name-24', 'biz'));
});

test('premium generator returns unique candidates', () => {
  const rows = makePremiumCandidates({ keyword: 'solar', count: 100 });
  assert.equal(rows.length, 100);
  assert.equal(new Set(rows.map(x => x.domain)).size, 100);
});

test('premium generator includes country-specific extensions', () => {
  const rows = makePremiumCandidates({ keyword: 'tech', count: 100 });
  const extensions = new Set(rows.map(x => x.tld));
  for (const tld of ['pk', 'in', 'us', 'de']) assert.equal(extensions.has(tld), true, `missing .${tld}`);
});
