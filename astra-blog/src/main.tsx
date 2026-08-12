/**
 * astra-blog — Entry (montaje + estilos globales)
 */
import { App } from './app.js';

const style = document.createElement('style');
style.textContent = `
  /* ── Reset & base ── */
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{font-family:'Inter',system-ui,-apple-system,sans-serif;background:#04060d;color:#e2e8f0;line-height:1.6;-webkit-font-smoothing:antialiased}
  a{color:inherit;text-decoration:none}
  img{max-width:100%}
  code{font-family:'JetBrains Mono','Fira Code',monospace}
  .blog-shell{display:flex;flex-direction:column;min-height:100vh}
  .blog-main{flex:1}
  .wrap{max-width:1080px;margin:0 auto;padding:0 28px}
  .page{padding-bottom:72px}

  /* ── Header ── */
  .site-header{position:sticky;top:0;z-index:50;background:rgba(4,6,13,.85);backdrop-filter:blur(14px);border-bottom:1px solid rgba(255,255,255,.06)}
  .site-header-inner{max-width:1080px;margin:0 auto;padding:0 28px;height:64px;display:flex;align-items:center;justify-content:space-between}
  .brand{display:flex;align-items:center;gap:10px;font-weight:800;font-size:1.05rem;letter-spacing:-.01em}
  .brand-mark{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:9px;background:linear-gradient(135deg,#b84cff,#4d7cff);color:#fff;font-size:.9rem;box-shadow:0 0 18px rgba(184,76,255,.35)}
  .brand-name{color:#f7f7ff}
  .site-nav{display:flex;gap:4px}
  .nav-link{padding:8px 14px;border-radius:8px;font-size:.85rem;font-weight:600;color:#94a3b8;transition:color .15s,background .15s}
  .nav-link:hover{color:#e2e8f0;background:rgba(255,255,255,.05)}

  /* ── Hero (home) ── */
  .hero{max-width:1080px;margin:0 auto;padding:88px 28px 64px;text-align:center}
  .hero-badge{display:inline-block;padding:6px 16px;border-radius:20px;background:rgba(184,76,255,.1);border:1px solid rgba(184,76,255,.25);color:#c4a0ff;font-size:.75rem;font-weight:600;margin-bottom:22px}
  .hero-title{font-size:3rem;font-weight:800;color:#f7f7ff;letter-spacing:-.03em;line-height:1.1;margin-bottom:18px}
  .hero-accent{background:linear-gradient(135deg,#b84cff 0%,#4d7cff 60%,#00dfff 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .hero-sub{font-size:1.02rem;color:#94a3b8;max-width:640px;margin:0 auto 30px;line-height:1.7}
  .hero-actions{display:flex;gap:14px;justify-content:center;margin-bottom:52px}
  .btn{display:inline-block;padding:11px 24px;border-radius:10px;font-size:.88rem;font-weight:700;transition:transform .15s,box-shadow .15s,background .15s;border:none;cursor:pointer}
  .btn-primary{background:linear-gradient(135deg,#b84cff,#4d7cff);color:#fff;box-shadow:0 4px 24px rgba(184,76,255,.3)}
  .btn-primary:hover{transform:translateY(-1px);box-shadow:0 8px 32px rgba(184,76,255,.4)}
  .btn-ghost{background:rgba(255,255,255,.04);color:#e2e8f0;border:1px solid rgba(255,255,255,.12)}
  .btn-ghost:hover{background:rgba(255,255,255,.08)}
  .hero-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;max-width:760px;margin:0 auto}
  .hero-stat{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:20px 12px}
  .hero-stat-num{display:block;font-size:1.6rem;font-weight:800;color:#f7f7ff;letter-spacing:-.02em}
  .hero-stat-lbl{font-size:.72rem;color:#64748b;text-transform:uppercase;letter-spacing:.06em}

  /* ── Secciones ── */
  .section{margin-top:56px}
  .section-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
  .section-title{font-size:1.3rem;font-weight:800;color:#f7f7ff;letter-spacing:-.02em;margin-bottom:18px}
  .section-title-mt{margin-top:36px}
  .section-sub{font-size:.88rem;color:#94a3b8;margin-bottom:18px}
  .section-link{font-size:.85rem;color:#b84cff;font-weight:600}
  .section-link:hover{text-decoration:underline}

  /* ── Cards de posts ── */
  .card-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:18px}
  .post-card{display:flex;flex-direction:column;gap:10px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:22px;transition:transform .18s,border-color .18s,box-shadow .18s}
  .post-card:hover{transform:translateY(-3px);border-color:rgba(184,76,255,.35);box-shadow:0 12px 40px rgba(184,76,255,.12)}
  .post-card-top{display:flex;align-items:center;justify-content:space-between}
  .post-card-category{font-size:.75rem;font-weight:700;color:#c4a0ff}
  .post-card-reading{font-size:.72rem;color:#64748b}
  .post-card-title{font-size:1.08rem;font-weight:800;color:#f7f7ff;line-height:1.35;letter-spacing:-.01em}
  .post-card-excerpt{font-size:.84rem;color:#94a3b8;line-height:1.6;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
  .post-card-meta{display:flex;align-items:center;justify-content:space-between;font-size:.78rem;color:#64748b}
  .post-card-author{font-weight:600;color:#e2e8f0}
  .post-card-tags{display:flex;flex-wrap:wrap;gap:6px}
  .tag-chip{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;background:rgba(139,77,255,.08);border:1px solid rgba(139,77,255,.18);color:#b8a0ff;font-size:.72rem;font-weight:600}
  .tag-link:hover{background:rgba(139,77,255,.16)}
  .tag-more{color:#64748b}
  .tag-count{color:#8b7cc9;font-size:.68rem}

  /* ── Split (recientes + categorías) ── */
  .split{display:grid;grid-template-columns:1.5fr 1fr;gap:40px}
  .recent-list{display:flex;flex-direction:column;gap:0}
  .recent-item{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:16px 4px;border-bottom:1px solid rgba(255,255,255,.05);transition:background .15s;border-radius:8px}
  .recent-item:hover{background:rgba(255,255,255,.02)}
  .recent-main{display:flex;flex-direction:column;gap:3px}
  .recent-title{font-size:.92rem;font-weight:700;color:#e2e8f0}
  .recent-item:hover .recent-title{color:#c4a0ff}
  .recent-excerpt{font-size:.78rem;color:#64748b;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
  .recent-meta{display:flex;flex-direction:column;align-items:flex-end;gap:2px;font-size:.74rem;color:#64748b;white-space:nowrap}
  .category-list{display:flex;flex-direction:column;gap:8px}
  .category-item{display:flex;align-items:center;gap:12px;padding:13px 16px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:12px;transition:border-color .15s,transform .15s}
  .category-item:hover{border-color:rgba(184,76,255,.3);transform:translateX(3px)}
  .category-icon{font-size:1.2rem}
  .category-main{display:flex;flex-direction:column;gap:1px;flex:1}
  .category-name{font-size:.88rem;font-weight:700;color:#e2e8f0}
  .category-desc{font-size:.74rem;color:#64748b}
  .category-count{font-size:.8rem;font-weight:800;color:#b84cff}
  .tag-cloud{display:flex;flex-wrap:wrap;gap:8px}
  .tag-cloud-center{justify-content:center}

  /* ── Autores ── */
  .author-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:14px}
  .author-mini{display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:20px 12px;transition:transform .15s,border-color .15s}
  .author-mini:hover{transform:translateY(-3px);border-color:rgba(184,76,255,.3)}
  .author-avatar{display:inline-flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:50%;background:rgba(139,77,255,.12);border:1px solid rgba(139,77,255,.25);font-size:1.4rem}
  .author-avatar-lg{width:92px;height:92px;font-size:2.8rem}
  .author-mini-name{font-size:.88rem;font-weight:700;color:#f7f7ff}
  .author-mini-role{font-size:.72rem;color:#64748b}
  .author-mini-count{font-size:.72rem;color:#c4a0ff;font-weight:600}

  /* ── CTA ── */
  .cta{text-align:center;background:linear-gradient(135deg,rgba(184,76,255,.08),rgba(77,124,255,.08));border:1px solid rgba(184,76,255,.2);border-radius:20px;padding:52px 32px}
  .cta h2{font-size:1.6rem;font-weight:800;color:#f7f7ff;margin-bottom:12px;letter-spacing:-.02em}
  .cta p{font-size:.9rem;color:#94a3b8;max-width:560px;margin:0 auto 26px;line-height:1.7}

  /* ── Footer ── */
  .site-footer{border-top:1px solid rgba(255,255,255,.06);background:#060b14;margin-top:40px}
  .footer-inner{max-width:1080px;margin:0 auto;padding:52px 28px 36px;display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr;gap:32px}
  .footer-brand{display:flex;align-items:center;gap:8px;font-weight:800;color:#f7f7ff;margin-bottom:14px}
  .footer-about p{font-size:.8rem;color:#64748b;line-height:1.7;margin-bottom:18px}
  .footer-socials{display:flex;gap:8px}
  .footer-socials a{padding:6px 14px;border-radius:8px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);font-size:.78rem;color:#94a3b8;transition:color .15s}
  .footer-socials a:hover{color:#e2e8f0}
  .footer-col-title{font-size:.72rem;font-weight:800;color:#475569;text-transform:uppercase;letter-spacing:.08em;margin-bottom:14px}
  .footer-link{display:block;font-size:.82rem;color:#94a3b8;padding:5px 0;transition:color .15s}
  .footer-link:hover{color:#c4a0ff}
  .footer-bottom{max-width:1080px;margin:0 auto;padding:20px 28px;border-top:1px solid rgba(255,255,255,.05);font-size:.74rem;color:#475569;text-align:center}

  /* ── Breadcrumbs ── */
  .crumbs{display:flex;align-items:center;gap:8px;font-size:.8rem;color:#64748b;margin:28px 0 22px}
  .crumb{display:inline-flex;align-items:center;gap:8px}
  .crumb a{color:#94a3b8;transition:color .15s}
  .crumb a:hover{color:#c4a0ff}
  .crumb-sep{color:#334155}
  .crumb-current{color:#e2e8f0;font-weight:600}

  /* ── Páginas estáticas ── */
  .static-hero{max-width:760px;margin:56px auto 0;text-align:center}
  .static-hero-sm{margin-top:40px}
  .static-hero h1{font-size:2.4rem;font-weight:800;color:#f7f7ff;letter-spacing:-.03em;margin-bottom:12px}
  .static-sub{font-size:.98rem;color:#94a3b8;line-height:1.7;margin-bottom:16px}
  .static-hero-text{font-size:.95rem;color:#cbd5e1;line-height:1.8;max-width:680px;margin:0 auto}
  .prose-block p{font-size:.92rem;color:#94a3b8;line-height:1.85;margin-bottom:16px}
  .pillar-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
  .pillar-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:22px}
  .pillar-icon{font-size:1.6rem;display:block;margin-bottom:10px}
  .pillar-card h3{font-size:.95rem;font-weight:700;color:#f7f7ff;margin-bottom:8px}
  .pillar-card p{font-size:.8rem;color:#94a3b8;line-height:1.65}
  .faq-list{display:flex;flex-direction:column;gap:10px;max-width:760px}
  .faq-item{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:16px 20px}
  .faq-item summary{font-size:.92rem;font-weight:700;color:#e2e8f0;cursor:pointer}
  .faq-item p{font-size:.84rem;color:#94a3b8;line-height:1.7;margin-top:10px}

  /* ── Contacto ── */
  .contact-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;max-width:980px;margin-left:auto;margin-right:auto}
  .contact-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:26px;text-align:center}
  .contact-icon{font-size:1.8rem;display:block;margin-bottom:12px}
  .contact-card h3{font-size:.95rem;font-weight:700;color:#f7f7ff;margin-bottom:10px}
  .contact-value{font-size:.9rem;color:#c4a0ff;line-height:1.6}
  .schedule-table{margin:0 auto;border-collapse:collapse;font-size:.82rem;color:#94a3b8}
  .schedule-table td{padding:6px 14px;border-bottom:1px solid rgba(255,255,255,.05)}
  .contact-socials{display:flex;gap:14px;justify-content:center}
  .contact-social{display:flex;flex-direction:column;align-items:center;gap:4px;padding:16px 28px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:14px;font-weight:700;color:#e2e8f0;transition:border-color .15s}
  .contact-social:hover{border-color:rgba(184,76,255,.35)}
  .contact-handle{font-size:.78rem;color:#64748b;font-weight:500}
  .note-banner{max-width:760px;margin:0 auto;padding:18px 22px;background:rgba(139,77,255,.07);border-left:3px solid rgba(139,77,255,.4);border-radius:0 12px 12px 0;font-size:.86rem;color:#c4a0ff;line-height:1.7}

  /* ── Blog index ── */
  .blog-tools{display:flex;flex-direction:column;gap:16px;align-items:center;margin-top:22px}
  .search-input{width:100%;max-width:560px;padding:14px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.1);background:#0a0f1a;color:#e2e8f0;font-size:.92rem;outline:none;transition:border-color .15s,box-shadow .15s}
  .search-input:focus{border-color:rgba(184,76,255,.5);box-shadow:0 0 0 3px rgba(184,76,255,.12)}
  .search-input::placeholder{color:#475569}
  .cat-filters{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
  .cat-filter{padding:7px 16px;border-radius:20px;border:1px solid rgba(255,255,255,.1);background:transparent;color:#94a3b8;font-size:.8rem;font-weight:600;cursor:pointer;transition:all .15s}
  .cat-filter:hover{color:#e2e8f0;border-color:rgba(255,255,255,.25)}
  .cat-filter.active{background:rgba(184,76,255,.14);border-color:rgba(184,76,255,.5);color:#c4a0ff}
  .result-count{font-size:.8rem;color:#64748b;margin-bottom:18px}
  .empty-state{text-align:center;padding:64px 24px}
  .empty-icon{font-size:2.6rem;display:block;margin-bottom:14px}
  .empty-state h3{font-size:1.1rem;color:#f7f7ff;margin-bottom:8px}
  .empty-state p{font-size:.88rem;color:#94a3b8;max-width:440px;margin:0 auto}

  /* ── Post article ── */
  .post-article{max-width:780px;margin:0 auto}
  .post-header{margin-bottom:34px}
  .post-kicker{display:flex;align-items:center;gap:16px;margin-bottom:14px;font-size:.78rem;color:#64748b}
  .post-category{font-weight:700;color:#c4a0ff}
  .post-title{font-size:2.2rem;font-weight:800;color:#f7f7ff;letter-spacing:-.03em;line-height:1.2;margin-bottom:14px}
  .post-excerpt{font-size:1rem;color:#94a3b8;line-height:1.7;margin-bottom:20px}
  .post-byline{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 0;border-top:1px solid rgba(255,255,255,.06);border-bottom:1px solid rgba(255,255,255,.06);margin-bottom:16px}
  .post-author-link{display:flex;align-items:center;gap:12px}
  .post-author-link strong{display:block;color:#f7f7ff;font-size:.9rem}
  .post-author-role{font-size:.75rem;color:#64748b}
  .post-date{font-size:.8rem;color:#64748b}
  .post-tags{display:flex;flex-wrap:wrap;gap:8px}
  .prose{font-size:.95rem;color:#cbd5e1;line-height:1.85}
  .prose-intro{font-size:1.05rem;color:#e2e8f0;margin-bottom:30px}
  .prose-section{margin-bottom:30px}
  .prose h2{font-size:1.35rem;font-weight:800;color:#f7f7ff;letter-spacing:-.01em;margin:38px 0 16px}
  .prose p{margin-bottom:16px}
  .prose-bullets{padding-left:24px;margin-bottom:28px}
  .prose-bullets li{margin-bottom:8px}
  .prose-quote{border-left:3px solid rgba(184,76,255,.5);background:rgba(184,76,255,.05);padding:18px 24px;border-radius:0 12px 12px 0;font-size:1.05rem;font-style:italic;color:#c4a0ff;margin:30px 0}
  .code-block{background:#060b14;border:1px solid rgba(255,255,255,.08);border-radius:12px;overflow:hidden;margin-bottom:30px}
  .code-block-title{padding:10px 18px;font-size:.74rem;font-weight:700;color:#64748b;border-bottom:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02)}
  .code-block pre{overflow-x:auto;padding:18px 22px;font-size:.78rem;line-height:1.8;color:#cbd5e1}
  .post-comments{margin-top:44px;padding-top:30px;border-top:1px solid rgba(255,255,255,.07)}
  .post-comments h2,.post-related h2,.post-contextual-list h2{font-size:1.15rem;font-weight:800;color:#f7f7ff;margin-bottom:18px}
  .comments-empty{font-size:.85rem;color:#64748b}
  .comment-list{display:flex;flex-direction:column;gap:12px}
  .comment{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:16px 20px}
  .comment-head{display:flex;justify-content:space-between;margin-bottom:6px;font-size:.8rem}
  .comment-head strong{color:#e2e8f0}
  .comment-head span{color:#64748b}
  .comment p{font-size:.86rem;color:#94a3b8;line-height:1.7}
  .post-related,.post-contextual-list{margin-top:44px}
  .post-header-contextual .contextual-badge{display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:8px;background:rgba(0,223,255,.08);border:1px solid rgba(0,223,255,.2);color:#7fd8e8;font-size:.76rem;font-weight:700;font-family:'JetBrains Mono',monospace;margin-bottom:16px}

  /* ── Taxonomía ── */
  .taxonomy-hero{max-width:760px;margin:40px auto 0;text-align:center}
  .taxonomy-icon{font-size:2.6rem;display:block;margin-bottom:10px}
  .taxonomy-hero h1{font-size:2rem;font-weight:800;color:#f7f7ff;letter-spacing:-.02em;margin-bottom:10px}
  .taxonomy-count{font-size:.82rem;color:#c4a0ff;font-weight:600}
  .intersect-symbol{color:#00dfff;padding:0 4px}

  /* ── Perfil de autor ── */
  .author-profile{display:grid;grid-template-columns:auto 1fr auto;gap:26px;align-items:start;max-width:860px;margin:0 auto;padding:36px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:20px}
  .author-profile-main{display:flex;flex-direction:column;gap:8px}
  .author-role{font-size:.9rem;font-weight:700;color:#c4a0ff}
  .author-bio{font-size:.9rem;color:#94a3b8;line-height:1.75}
  .author-meta{display:flex;flex-wrap:wrap;gap:14px;font-size:.78rem;color:#64748b}
  .author-socials{display:flex;gap:8px;margin-top:6px}
  .author-socials a{padding:6px 14px;border-radius:8px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);font-size:.78rem;color:#94a3b8;transition:color .15s,border-color .15s}
  .author-socials a:hover{color:#c4a0ff;border-color:rgba(184,76,255,.35)}
  .author-stats{display:flex;flex-direction:column;gap:12px}
  .author-stat{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:14px 18px;text-align:center;min-width:110px}
  .author-stat-num{display:block;font-size:1.4rem;font-weight:800;color:#f7f7ff}
  .author-stat-lbl{font-size:.7rem;color:#64748b;text-transform:uppercase;letter-spacing:.05em}
  .specialty-list{display:flex;flex-wrap:wrap;gap:8px}
  .specialty-chip{padding:7px 16px;border-radius:20px;background:rgba(139,77,255,.08);border:1px solid rgba(139,77,255,.2);color:#b8a0ff;font-size:.8rem;font-weight:600}

  /* ── 404 / not found ── */
  .notfound-block{max-width:640px;margin:0 auto;padding:80px 32px;text-align:center}
  .notfound-full{padding-top:100px}
  .notfound-emoji{font-size:3.4rem;display:block;margin-bottom:18px}
  .notfound-block h1{font-size:1.8rem;font-weight:800;color:#f7f7ff;letter-spacing:-.02em;margin-bottom:14px}
  .notfound-block p{font-size:.92rem;color:#94a3b8;line-height:1.75;margin-bottom:26px}
  .notfound-block code{background:rgba(139,77,255,.1);color:#c4a0ff;padding:2px 8px;border-radius:5px;font-size:.82rem}
  .orphan-actions{display:flex;gap:12px;justify-content:center;margin-bottom:30px}
  .notfound-suggestions{margin-top:34px;padding-top:28px;border-top:1px solid rgba(255,255,255,.06)}

  /* ── Responsive ── */
  @media(max-width:900px){
    .hero-title{font-size:2.2rem}
    .hero-stats{grid-template-columns:repeat(2,1fr)}
    .card-grid{grid-template-columns:1fr}
    .split{grid-template-columns:1fr}
    .author-grid{grid-template-columns:repeat(2,1fr)}
    .pillar-grid{grid-template-columns:repeat(2,1fr)}
    .contact-grid{grid-template-columns:1fr}
    .footer-inner{grid-template-columns:1fr 1fr}
    .author-profile{grid-template-columns:1fr;text-align:center}
    .author-stats{flex-direction:row;justify-content:center}
    .site-nav{display:none}
  }
`;
document.head.appendChild(style);

const root = document.getElementById('app');
if (root && !root.hasChildNodes()) {
  root.appendChild(App({}) as unknown as Node);
}
