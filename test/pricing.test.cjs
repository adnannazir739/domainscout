const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('never presents a TLD baseline as the exact domain price', () => {
  const main = fs.readFileSync(require.resolve('../src/main.cjs'), 'utf8');
  const renderer = fs.readFileSync(require.resolve('../src/renderer.js'), 'utf8');
  assert.equal(main.includes("price: null, priceVerified: false"), true);
  assert.equal(renderer.includes('Price unknown'), true);
  assert.equal(renderer.includes('row.price.toFixed'), false);
});
