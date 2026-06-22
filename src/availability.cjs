const IANA_BOOTSTRAP_URL = 'https://data.iana.org/rdap/dns.json';
const DNS_URL = 'https://cloudflare-dns.com/dns-query';

let bootstrapPromise;

function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

async function loadRdapBootstrap() {
  if (!bootstrapPromise) {
    bootstrapPromise = fetchWithTimeout(IANA_BOOTSTRAP_URL, { headers: { Accept: 'application/json' } }, 12000)
      .then(response => {
        if (!response.ok) throw new Error(`IANA bootstrap returned ${response.status}`);
        return response.json();
      })
      .then(data => {
        const services = new Map();
        for (const [tlds, urls] of data.services || []) {
          const url = urls.find(value => value.startsWith('https://')) || urls[0];
          if (url) tlds.forEach(tld => services.set(String(tld).toLowerCase(), url));
        }
        return services;
      })
      .catch(() => new Map());
  }
  return bootstrapPromise;
}

async function hasDnsRegistrationEvidence(domain) {
  try {
    const response = await fetchWithTimeout(`${DNS_URL}?name=${encodeURIComponent(domain)}&type=NS`, {
      headers: { Accept: 'application/dns-json' }
    });
    if (!response.ok) return false;
    const body = await response.json();
    return Array.isArray(body.Answer) && body.Answer.length > 0;
  } catch { return false; }
}

async function authoritativeRdapStatus(domain, services) {
  const registryTld = domain.split('.').at(-1).toLowerCase();
  const baseUrl = services.get(registryTld);
  if (!baseUrl || !baseUrl.startsWith('https://')) return 'unsupported';
  try {
    const separator = baseUrl.endsWith('/') ? '' : '/';
    const response = await fetchWithTimeout(`${baseUrl}${separator}domain/${encodeURIComponent(domain)}`, {
      headers: { Accept: 'application/rdap+json, application/json' }
    });
    if (response.ok) return 'registered';
    if (response.status === 404) return 'not_found';
    return 'error';
  } catch { return 'error'; }
}

async function verifyDomain(domain) {
  const [services, dnsRegistered] = await Promise.all([loadRdapBootstrap(), hasDnsRegistrationEvidence(domain)]);
  if (dnsRegistered) return { status: 'registered', source: 'DNS delegation confirmed', confidence: 'confirmed' };

  const rdap = await authoritativeRdapStatus(domain, services);
  if (rdap === 'registered') return { status: 'registered', source: 'Authoritative registry RDAP', confidence: 'confirmed' };
  if (rdap === 'not_found') {
    return { status: 'likely_available', source: 'Authoritative registry RDAP + DNS', confidence: 'verify at registrar' };
  }
  return {
    status: 'unknown',
    source: rdap === 'unsupported' ? 'Registry has no RDAP availability service' : 'Registry check unavailable',
    confidence: 'unverified'
  };
}

module.exports = { verifyDomain, loadRdapBootstrap, hasDnsRegistrationEvidence, authoritativeRdapStatus };
