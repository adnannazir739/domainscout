const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('Namecheap links use the approved Impact campaign and preserve exact domain search', () => {
  const main = fs.readFileSync(require.resolve('../src/main.cjs'), 'utf8');
  assert.match(main, /namecheap\.pxf\.io\/c\/7430137\/1632743\/5618/);
  assert.match(main, /namecheapDestination/);
  assert.match(main, /encodeURIComponent\(namecheapDestination\)/);
});

test('affiliate relationship is disclosed in the app', () => {
  const html = fs.readFileSync(require.resolve('../src/index.html'), 'utf8');
  assert.match(html, /Namecheap links are affiliate links/);
});

test('affiliate ad slots are present and clearly controlled by approved links', () => {
  const main = fs.readFileSync(require.resolve('../src/main.cjs'), 'utf8');
  const preload = fs.readFileSync(require.resolve('../src/preload.cjs'), 'utf8');
  const renderer = fs.readFileSync(require.resolve('../src/renderer.js'), 'utf8');
  const html = fs.readFileSync(require.resolve('../src/index.html'), 'utf8');
  assert.match(html, /data-ad-slot="sidebar"/);
  for (const removedSlot of ['top', 'bulk', 'premium', 'help']) assert.doesNotMatch(html, new RegExp(`data-ad-slot="${removedSlot}"`));
  assert.match(main, /https:\/\/domainscout\.vortixvpn\.com\/ads\.json/);
  assert.match(main, /FALLBACK_AFFILIATE_ADS/);
  assert.match(main, /new Set\(\['sidebar'\]\)/);
  assert.match(preload, /getAffiliateAds/);
  assert.match(renderer, /renderAffiliateAds/);
  assert.match(renderer, /data-ad-url/);
});

test('pending GoDaddy promotion is not shown', () => {
  const main = fs.readFileSync(require.resolve('../src/main.cjs'), 'utf8');
  const renderer = fs.readFileSync(require.resolve('../src/renderer.js'), 'utf8');
  assert.equal(main.includes('godaddy.com/domainsearch'), false);
  assert.equal(renderer.includes('GoDaddy'), false);
});

test('purchase button accurately describes the external checkout step', () => {
  const renderer = fs.readFileSync(require.resolve('../src/renderer.js'), 'utf8');
  assert.match(renderer, /Check Price &amp; Buy/);
});
