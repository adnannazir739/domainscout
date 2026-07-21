document.getElementById('year').textContent = new Date().getFullYear();

const menu = document.querySelector('.menu');
const nav = document.querySelector('.nav nav');
if (menu && nav) menu.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

const storeUrl = 'https://apps.microsoft.com/store/detail/XP8LWRQNMQ5XHX';
const storePrefix = location.pathname.includes('/articles/') ? '../' : '';
const storeStyle = document.createElement('style');
storeStyle.textContent = `
  .store-badge{display:inline-flex;align-items:center;line-height:0;text-decoration:none}
  .store-badge img{height:56px;width:auto;border-radius:9px;box-shadow:0 14px 35px #0004}
  .store-badge.small img{height:42px}
  .hero-actions{align-items:center;flex-wrap:wrap}
  .article-grid,.related-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:38px}
  .article-card,.related-grid a{border:1px solid var(--line);background:var(--panel);padding:20px;border-radius:12px;text-decoration:none}
  .article-card h2{font-size:18px;margin:0 0 8px}
  .article-card p{color:var(--muted);margin:0}
  .article-download{margin:24px 0}
  .article-page ul{color:#a8bab3}
  .site-download-float{position:fixed;right:18px;bottom:18px;z-index:20}
  .site-download-float img{height:46px;border-radius:8px;box-shadow:0 14px 38px #0007}
  @media(max-width:720px){.article-grid,.related-grid{grid-template-columns:1fr}.cta .store-badge{margin-top:25px}.site-download-float{display:none}}
`;
document.head.appendChild(storeStyle);

if (!document.querySelector('.site-download-float')) {
  const link = document.createElement('a');
  link.className = 'site-download-float';
  link.href = storeUrl;
  link.target = '_blank';
  link.rel = 'noopener';
  link.setAttribute('aria-label', 'Download Domain Scout AI from the Microsoft Store');
  link.innerHTML = `<img src="${storePrefix}assets/microsoft-store-badge.png" alt="Download from the Microsoft Store">`;
  document.body.appendChild(link);
}
