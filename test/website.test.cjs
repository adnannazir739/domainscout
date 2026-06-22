const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const website = path.resolve(__dirname, '..', 'website');
const htmlFiles = fs.readdirSync(website).filter(file => file.endsWith('.html'));

test('website internal links and assets resolve', () => {
  const missing = [];
  for (const file of htmlFiles) {
    const html = fs.readFileSync(path.join(website, file), 'utf8');
    for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const target = match[1];
      if (/^(https?:|mailto:|#)/.test(target)) continue;
      const localPath = target.split('#')[0];
      if (localPath && !fs.existsSync(path.join(website, localPath))) missing.push(`${file} -> ${target}`);
    }
  }
  assert.deepEqual(missing, []);
});

test('production pages contain no domain, email, or encoding placeholders', () => {
  const problems = [];
  for (const file of htmlFiles) {
    const html = fs.readFileSync(path.join(website, file), 'utf8');
    if (/YOUR-DOMAIN|support@|â|Â|Ã/.test(html)) problems.push(file);
  }
  assert.deepEqual(problems, []);
});

test('production contact and canonical domain are configured', () => {
  const index = fs.readFileSync(path.join(website, 'index.html'), 'utf8');
  const privacy = fs.readFileSync(path.join(website, 'privacy.html'), 'utf8');
  assert.match(index, /https:\/\/domainscout\.vortixvpn\.com\//);
  assert.match(index, /contact@vortixvpn\.com/);
  assert.match(privacy, /contact@vortixvpn\.com/);
});
