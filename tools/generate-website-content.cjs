const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const website = path.join(root, 'website');
const articlesDir = path.join(website, 'articles');
const STORE_URL = 'https://apps.microsoft.com/store/detail/XP8LWRQNMQ5XHX';
const STORE_DEEP_LINK = 'ms-windows-store://pdp/?productid=XP8LWRQNMQ5XHX';
const SITE = 'https://domainscout.vortixvpn.com';
const today = '2026-07-21';

fs.mkdirSync(articlesDir, { recursive: true });

function slugify(value) {
  return value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function titleCase(slug) {
  return slug.split('-').map(word => word ? word[0].toUpperCase() + word.slice(1) : '').join(' ');
}

function downloadButton(label = 'Download from Microsoft Store') {
  return `<a class="store-badge" href="${STORE_URL}" target="_blank" rel="noopener" aria-label="${label}"><img src="../assets/microsoft-store-badge.png" alt="${label}" loading="lazy"></a>`;
}

function siteDownloadButton(label = 'Download from Microsoft Store') {
  return `<a class="store-badge" href="${STORE_URL}" target="_blank" rel="noopener" aria-label="${label}"><img src="assets/microsoft-store-badge.png" alt="${label}" loading="lazy"></a>`;
}

function pageShell({ title, description, canonical, body, article = false }) {
  const prefix = article ? '../' : '';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="description" content="${description}">
  <meta name="theme-color" content="#08110f">
  <link rel="canonical" href="${canonical}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <title>${title}</title>
  <link rel="icon" href="${prefix}assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="${prefix}assets/site.css">
</head>
<body>
  <div class="glow glow-a"></div><div class="glow glow-b"></div>
  <header class="nav shell">
    <a class="logo" href="${prefix}index.html" aria-label="Domain Scout AI home"><span>DS</span><b>Domain Scout <i>AI</i></b></a>
    <button class="menu" aria-label="Open navigation" aria-expanded="false">Menu</button>
    <nav aria-label="Main navigation">
      <a href="${prefix}index.html#features">Features</a><a href="${prefix}index.html#how">How it works</a><a href="${prefix}articles.html">Articles</a><a href="${prefix}support.html">Support</a>
      <a class="nav-cta" href="${STORE_URL}" target="_blank" rel="noopener">Download</a>
    </nav>
  </header>
${body}
  <footer class="shell">
    <div><a class="logo" href="${prefix}index.html"><span>DS</span><b>Domain Scout <i>AI</i></b></a><p>Thoughtful domain discovery for Windows.</p>${article ? downloadButton() : siteDownloadButton()}</div>
    <div><b>Product</b><a href="${prefix}index.html#features">Features</a><a href="${prefix}index.html#how">How it works</a><a href="${prefix}articles.html">Articles</a><a href="${prefix}support.html">Support</a></div>
    <div><b>Legal</b><a href="${prefix}privacy.html">Privacy</a><a href="${prefix}terms.html">Terms</a><a href="${prefix}affiliate-disclosure.html">Affiliate disclosure</a></div>
    <p class="copyright">© <span id="year"></span> Domain Scout AI. All rights reserved.</p>
  </footer>
  <script src="${prefix}assets/site.js"></script>
</body>
</html>
`;
}

const topics = [
  'bulk domain search for startup names',
  'how to check domain availability across tlds',
  'ai domain name generator for founders',
  'premium domain ideas without premium resale prices',
  'how to find brandable dot ai domains',
  'dot com versus dot io for startups',
  'dot ai domain ideas for software products',
  'dot xyz domains for modern brands',
  'country domain extensions for global startups',
  'how to shortlist domain names faster',
  'domain brandability score explained',
  'why exact domain prices must be confirmed',
  'how to avoid misleading domain price estimates',
  'finding domains for saas products',
  'domain name research workflow',
  'how founders can compare domain extensions',
  'short domain names and brand recall',
  'domain ideas for ai tools',
  'domain ideas for fintech startups',
  'domain ideas for ecommerce stores',
  'domain ideas for creator brands',
  'domain ideas for local businesses',
  'how to choose a domain for a blog',
  'how to choose a domain for an app',
  'domain extension strategy for new brands',
  'cheap domain research tips',
  'how to find available dot io domains',
  'how to find available dot ai domains',
  'how to find available dot shop domains',
  'how to find available dot app domains',
  'how to find available dot us domains',
  'how to find available dot in domains',
  'how to find available dot pk domains',
  'domain names for agencies',
  'domain names for tech consultants',
  'domain names for marketing tools',
  'domain names for crypto dashboards',
  'domain names for analytics products',
  'domain names for productivity apps',
  'domain names for travel brands',
  'domain names for health startups',
  'domain names for education platforms',
  'domain names for real estate brands',
  'domain names for security tools',
  'domain names for vpn brands',
  'domain names for developer tools',
  'domain names for marketplaces',
  'domain names for newsletters',
  'domain names for podcasts',
  'domain names for communities',
  'how to evaluate future domain value',
  'why some available domains may become valuable',
  'domain resale potential for beginners',
  'how to avoid overpaying for domains',
  'premium domain discovery checklist',
  'brandable domain checklist',
  'domain name mistakes to avoid',
  'hyphens and numbers in domain names',
  'short words versus descriptive domains',
  'invented brand names versus keyword domains',
  'how to use ai to brainstorm names',
  'how to use bulk search in domain scout ai',
  'how to use random premium search',
  'how to export domain search results',
  'how to compare registered and available domains',
  'what likely available means',
  'what unverified domain status means',
  'domain registry checks explained',
  'rdap domain availability explained',
  'dns checks for domain research',
  'domain name privacy and affiliate links',
  'how registrar affiliate links work',
  'namecheap domain search workflow',
  'how to confirm domain checkout price',
  'renewal pricing for domain buyers',
  'premium registry pricing explained',
  'reserved domain names explained',
  'domain ideas for solopreneurs',
  'domain ideas for side projects',
  'domain ideas for ai agents',
  'domain ideas for mobile apps',
  'domain ideas for windows apps',
  'domain ideas for b2b products',
  'domain ideas for consumer apps',
  'domain ideas for newsletters and communities',
  'domain ideas for personal brands',
  'domain ideas for open source projects',
  'domain search for small businesses',
  'domain search for agencies',
  'domain search for indie hackers',
  'domain search for product managers',
  'domain search for marketers',
  'domain naming for global audiences',
  'domain naming for pakistan india and us markets',
  'domain naming with country code tlds',
  'domain naming for ai startups',
  'domain naming for ecommerce',
  'domain naming for fintech',
  'domain naming for cybersecurity',
  'domain naming for analytics tools',
  'domain naming for productivity software',
  'domain discovery tools for windows users'
];

function articleHtml(topic, index, previous, next) {
  const title = titleCase(slugify(topic));
  const slug = slugify(topic);
  const related = [previous, next, topics[(index + 7) % topics.length], topics[(index + 17) % topics.length]]
    .filter(Boolean)
    .map(item => ({ title: titleCase(slugify(item)), slug: slugify(item) }));
  const description = `${title}: practical domain research guidance from Domain Scout AI for Windows.`;
  const canonical = `${SITE}/articles/${slug}.html`;
  const body = `  <main class="legal article-page shell">
    <p class="kicker">DOMAIN GUIDE</p>
    <h1>${title}</h1>
    <p class="updated">Updated: July 21, 2026</p>
    <div class="article-download">${downloadButton('Download Domain Scout AI from the Microsoft Store')}</div>
    <article>
      <p class="notice">Domain Scout AI is a Windows app for bulk domain availability checks, AI-assisted name ideas, brandability scoring, CSV export, and safe external registrar links. It helps you build a better shortlist before you confirm final availability and price at a registrar.</p>
      <h2>Why this topic matters</h2>
      <p>${title} is part of a practical naming workflow: start with a clear keyword, explore multiple extensions, compare the shape of each name, and avoid trusting a single price estimate until you reach the registrar checkout page. A domain that looks ordinary today can sometimes become more interesting as a market, product category, or community grows, but future resale value is never guaranteed.</p>
      <p>Domain Scout AI is designed for that early research stage. You can test one word across extensions such as .com, .net, .org, .io, .ai, .xyz, .us, .de, .in, .pk, .shop, .app, and more. The goal is not to promise a winning investment. The goal is to help you discover names that are short, clear, memorable, and worth checking before someone else registers them.</p>
      <h2>How Domain Scout AI helps</h2>
      <p>The app combines bulk extension search with AI-assisted premium discovery. In this context, premium does not mean a registrar resale listing with a huge asking price. It means a name that may be clean, brandable, easy to remember, and potentially useful for a future business, app, newsletter, marketplace, or software product.</p>
      <p>Results use conservative labels. Registered means the app found registration evidence. Likely available means the app did not find registration evidence through supported checks, but the registrar still has the final word. Unverified means the registry path was ambiguous, often for country-specific extensions, so you should confirm manually before making decisions.</p>
      <h2>A careful research checklist</h2>
      <ul>
        <li>Search the main keyword first, then try short variations.</li>
        <li>Compare traditional extensions like .com and .org with modern extensions like .ai, .io, .xyz, .app, and .shop.</li>
        <li>Use country extensions when the brand has a regional audience, such as .us, .in, .pk, or .de.</li>
        <li>Prefer names that are easy to say, spell, and remember.</li>
        <li>Confirm exact purchase price, renewal price, premium registry status, and restrictions at the registrar before buying.</li>
      </ul>
      <h2>About cost and future value</h2>
      <p>Some valuable domains are expensive because someone already owns them or because a registry prices them as premium. But not every good name begins as expensive. Occasionally, a clean available domain can be registered at a normal price and later become more valuable because the category grows or because a buyer wants that exact name. That possibility is why disciplined research matters.</p>
      <p>Domain Scout AI can help you discover candidates faster, but it cannot predict future resale value. Treat brandability scores as signals, not guarantees. If a name looks promising, confirm the real price and registration terms using the external registrar link.</p>
      <h2>Download Domain Scout AI</h2>
      <p>If you want to research ${topic} faster, download Domain Scout AI for Windows from the Microsoft Store.</p>
      <p>${downloadButton('Download Domain Scout AI from the Microsoft Store')}</p>
      <h2>Related domain guides</h2>
      <div class="related-grid">${related.map(item => `<a href="${item.slug}.html">${item.title}</a>`).join('')}</div>
    </article>
  </main>`;
  return pageShell({ title: `${title} — Domain Scout AI`, description, canonical, body, article: true });
}

const slugs = topics.map(slugify);
topics.forEach((topic, index) => {
  const html = articleHtml(topic, index, topics[index - 1], topics[index + 1]);
  fs.writeFileSync(path.join(articlesDir, `${slugs[index]}.html`), html);
});

const cards = topics.map((topic, index) => {
  const slug = slugs[index];
  const title = titleCase(slug);
  return `<article class="article-card"><h2><a href="articles/${slug}.html">${title}</a></h2><p>Practical tips for finding available, brandable domains with Domain Scout AI.</p></article>`;
}).join('\n');

const articlesIndexBody = `  <main class="legal shell article-index">
    <p class="kicker">DOMAIN SCOUT AI GUIDES</p>
    <h1>Domain name articles and naming guides</h1>
    <p class="updated">Learn how to search, compare, shortlist, and verify domains before you buy.</p>
    <div class="article-download">${siteDownloadButton('Download Domain Scout AI from the Microsoft Store')}</div>
    <section class="article-grid">${cards}</section>
  </main>`;

fs.writeFileSync(path.join(website, 'articles.html'), pageShell({
  title: 'Domain Name Articles and Naming Guides — Domain Scout AI',
  description: 'Read Domain Scout AI guides about domain search, brandable names, TLDs, AI domain ideas, and availability checks.',
  canonical: `${SITE}/articles.html`,
  body: articlesIndexBody
}));

const sitemapUrls = [
  ['', 'index.html'],
  ['support', 'support.html'],
  ['privacy', 'privacy.html'],
  ['terms', 'terms.html'],
  ['affiliate-disclosure', 'affiliate-disclosure.html'],
  ['articles', 'articles.html'],
  ...slugs.map(slug => [`articles/${slug}`, `articles/${slug}.html`])
].map(([urlPath]) => `  <url><loc>${SITE}/${urlPath}</loc><lastmod>${today}</lastmod></url>`).join('\n');

fs.writeFileSync(path.join(website, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls}
</urlset>
`);
