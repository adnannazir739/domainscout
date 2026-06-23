const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const main = fs.readFileSync(require.resolve('../src/main.cjs'), 'utf8');
const html = fs.readFileSync(require.resolve('../src/index.html'), 'utf8');

test('native Help menu contains Store-ready support and legal links', () => {
  for (const label of ['Help & Support', 'Visit Domain Scout Website', 'Contact Us', 'Privacy Policy', 'Terms of Use', 'Affiliate Disclosure', 'About Domain Scout AI']) {
    assert.match(main, new RegExp(label.replace(/[&]/g, '\\&')));
  }
});

test('public website links use the verified HTTPS domain', () => {
  for (const path of ['support', 'privacy', 'terms', 'affiliate-disclosure']) {
    assert.match(main, new RegExp(`https://domainscout\\.vortixvpn\\.com/${path}`));
  }
});

test('in-app Help and Legal view exposes all required destinations', () => {
  assert.match(html, /id="help-view"/);
  for (const key of ['support', 'website', 'contact', 'privacy', 'terms', 'affiliate']) assert.match(html, new RegExp(`data-public-link="${key}"`));
});
