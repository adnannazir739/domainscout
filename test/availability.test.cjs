const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('never uses the unreliable rdap.org aggregator', () => {
  const source = fs.readFileSync(require.resolve('../src/availability.cjs'), 'utf8');
  assert.equal(source.includes('rdap.org/domain'), false);
  assert.equal(source.includes('data.iana.org/rdap/dns.json'), true);
});

test('premium results exclude registered but keep honestly labeled unverified country domains', () => {
  const source = fs.readFileSync(require.resolve('../src/main.cjs'), 'utf8');
  assert.equal(source.includes("checked.filter(x => x.status !== 'registered')"), true);
});
