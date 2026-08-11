import { component, store, dynamic } from '@astrajs/core';
import { Link, navigate } from '@astrajs/router';

export const HomePage = component(() => {
  const tabsState = store({ activeTab: 'store' as 'store' | 'server' | 'css' | 'router' });

  // ── Dashboard reactive state ──
  const dash = store({
    activeNav: 'Overview' as string,
    period: 0, // 0=Today, 1=Week, 2=Month
    search: '',
    chartData: [60,75,45,90,55,80,70,95,65,85,50,72,88,68,92,78,62,85,95,72],
    selectedBar: -1,
    products: [
      { name: 'Wireless Headphones', price: 42.50, sales: 1240 },
      { name: 'Mechanical Keyboard', price: 3120, sales: 890 },
      { name: 'USB-C Hub', price: 2900, sales: 756 },
      { name: 'Smart Watch', price: 2430, sales: 632 },
      { name: 'Webcam 4K', price: 189, sales: 510 },
      { name: 'Monitor 27"', price: 449, sales: 423 },
    ],
  });

  const periods = ['Today', 'This Week', 'This Month'];
  const periodMultiplier = [1, 7, 30];

  const getStatValue = (base: number, decimals = 0) => {
    const val = base * periodMultiplier[dash.period];
    return decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString();
  };
  const getStatChange = (base: number) => (base + dash.period * 1.5).toFixed(1);

  const filteredProducts = () => {
    const q = dash.search.toLowerCase();
    return q
      ? dash.products.filter(p => p.name.toLowerCase().includes(q))
      : dash.products;
  };

  const navItems = ['Overview', 'Orders', 'Products', 'Customers', 'Analytics', 'Settings'];
  const allProducts = dash.products;

  const randomizeChart = () => {
    dash.chartData = Array.from({ length: 20 }, () => Math.floor(Math.random() * 85 + 15));
  };

  const tabCode: Record<string, string> = {
    store: `import { store } from '@astrajs/core';

const state = store({
    products: [] as Product[],
    total: 0
}, { key: 'cart', swr: true });`,
    server: `import { server } from '@astrajs/server';

export const loadProducts = server(() => ({
    type: 'pre-build',
    tags: ['products'],
    maxAge: 3600
}), async () => {
    const res = await fetch(
        'https://api.example.com/products'
    );
    return res.json();
});`,
    css: `import { css } from '@astrajs/core';

const cardStyle = css\`
    background: #0f172a;
    border: 1px solid #1e293b;
    border-radius: 14px;
    padding: 24px;

    &:hover {
        border-color: #818cf8;
    }
\`;`,
    router: `import { route, Link, Outlet } from '@astrajs/router';

// routes.ts
export const routes = {
    get dashboard() {
        return route('/', { exact: true });
    },
    get products() {
        return route('/products');
    },
};`,
  };

  const style = `
    /* === HERO === */
    .hero{position:relative;overflow:hidden;height:calc(100vh - 64px);text-align:center;display:flex;align-items:center;justify-content:flex-start;flex-direction:column;padding-top:16vh}
    .hero .container{position:relative;z-index:1}
    .hero-bg{position:absolute;inset:0;pointer-events:none;background:url('/images/bg.png') center/cover no-repeat;opacity:.50}
    .hero-bg::before{content:'';position:absolute;top:-40%;left:50%;transform:translateX(-50%);width:900px;height:900px;background:radial-gradient(circle,rgba(139,77,255,.08) 0%,transparent 70%)}
    .hero-bg::after{content:'';position:absolute;bottom:-30%;left:50%;transform:translateX(-50%);width:700px;height:700px;background:radial-gradient(circle,rgba(0,223,255,.05) 0%,transparent 70%)}

    /* === STARFIELD === */
    .stars{position:absolute;inset:0;overflow:hidden;pointer-events:none}
    .stars-layer{position:absolute;inset:0;width:1px;height:1px;border-radius:50%;animation:twinkle var(--dur) ease-in-out infinite;animation-delay:var(--delay);opacity:0}
    .stars-layer::before,.stars-layer::after{content:'';position:absolute;width:1px;height:1px;border-radius:50%;background:#fff}
    @keyframes twinkle{0%,100%{opacity:0}30%{opacity:.8}60%{opacity:.3}}
    @keyframes drift{0%{transform:translateY(0)}100%{transform:translateY(-100vh)}}
    .stars-slow{animation:drift 120s linear infinite}
    .stars-mid{animation:drift 80s linear infinite}
    .stars-fast{animation:drift 40s linear infinite}
    .star{position:absolute;width:2px;height:2px;background:#fff;border-radius:50%;animation:twinkle var(--dur) ease-in-out infinite;animation-delay:var(--delay);opacity:0;pointer-events:none}
    .star.purple{background:#b84cff;box-shadow:0 0 3px #b84cff}
    .star.cyan{background:#00dfff;box-shadow:0 0 3px #00dfff}
    .star.small{width:1px;height:1px}
    .star.medium{width:2px;height:2px}
    .star.large{width:3px;height:3px;box-shadow:0 0 6px currentColor}
    .hero-logo{display:inline-block;margin-bottom:32px;position:relative}
    .hero-logo img{height:120px;width:auto;object-fit:contain;filter:drop-shadow(0 0 20px rgba(184,76,255,.5)) drop-shadow(0 0 50px rgba(77,124,255,.3)) drop-shadow(0 0 90px rgba(0,223,255,.15))}
    .hero-logo::after{content:'';position:absolute;inset:-30px;background:radial-gradient(circle,rgba(139,77,255,.15) 0%,transparent 70%);border-radius:50%;pointer-events:none;z-index:-1}
    .hero-brand{font-family:'Fauna Pro',serif;font-size:3rem;font-weight:500;color:#ffffff;letter-spacing:.06em;margin-bottom:12px;line-height:1.1;position:relative;z-index:2;text-shadow:0 0 80px rgba(255,255,255,.15),0 0 160px rgba(255,255,255,.05)}
    .hero-tagline{font-size:1.25rem;color:rgba(255,255,255,.95);font-weight:400;max-width:600px;margin:0 auto 12px;line-height:1.5}
    .hero-sub{font-size:.95rem;color:#94a3b8;max-width:580px;margin:0 auto 40px;line-height:1.65}
    .hero-buttons{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
    .btn-primary{display:inline-flex;align-items:center;gap:8px;font-size:.88rem;font-weight:600;color:#fff;background:linear-gradient(135deg,#8d4dff,#4d7cff);padding:12px 28px;border-radius:10px;transition:opacity .15s,transform .15s,box-shadow .15s;cursor:pointer;border:none;letter-spacing:.01em}
    .btn-primary:hover{opacity:.92;transform:translateY(-2px);box-shadow:0 8px 30px rgba(139,77,255,.35)}
    .btn-secondary{display:inline-flex;align-items:center;gap:8px;font-size:.88rem;font-weight:600;color:#e2e8f0;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);padding:12px 28px;border-radius:10px;transition:background .15s,border-color .15s;cursor:pointer;letter-spacing:.01em}
    .btn-secondary:hover{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.18)}
    @media(max-width:640px){
      .hero{height:auto;min-height:100vh;padding:100px 0 80px}
      .hero-brand{font-size:2rem}
      .hero-tagline{font-size:1.05rem}
      .hero-logo img{height:90px;width:auto}
    }

    /* === SCROLL DOWN === */
    .scroll-down{position:absolute;bottom:32px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:4px;z-index:2;cursor:pointer}
    .scroll-down span{font-size:.64rem;font-weight:600;color:#475569;text-transform:uppercase;letter-spacing:.1em}
    .scroll-down-arrow{width:14px;height:14px;border-right:2px solid #475569;border-bottom:2px solid #475569;transform:rotate(45deg);animation:bounce 2s ease-in-out infinite}
    @keyframes bounce{0%,100%{transform:rotate(45deg) translate(0,0);opacity:.4}50%{transform:rotate(45deg) translate(3px,3px);opacity:1}}

    /* === STATS BAR === */
    .stats-bar{display:flex;justify-content:center;flex-wrap:wrap;gap:32px 48px;padding:32px 0;border-top:1px solid rgba(255,255,255,.05);border-bottom:1px solid rgba(255,255,255,.05);margin-bottom:80px}
    .stat-item{text-align:center}
    .stat-num{font-size:1.15rem;font-weight:800;color:#f7f7ff;letter-spacing:-.01em}
    .stat-num.gradient{background:linear-gradient(135deg,#b84cff,#4d7cff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
    .stat-desc{font-size:.72rem;color:#64748b;font-weight:500;margin-top:2px}
    @media(max-width:640px){.stats-bar{gap:20px 28px}}

    /* === SECTION === */
    .section{padding:80px 0}
    .section-inner{max-width:1200px;margin:0 auto;padding:0 32px}
    .section-label{font-size:.7rem;font-weight:700;color:#8d4dff;text-transform:uppercase;letter-spacing:.12em;margin-bottom:12px}
    .section-title{font-size:2rem;font-weight:800;color:#f7f7ff;letter-spacing:-.02em;margin-bottom:16px;line-height:1.2}
    .section-subtitle{font-size:.92rem;color:#64748b;max-width:600px;line-height:1.65}
    @media(max-width:640px){.section{padding:50px 0}.section-title{font-size:1.5rem}}

    /* === FEATURE SHOWCASE (Sin Virtual DOM) === */
    .feature-showcase{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;margin-top:48px}
    .feature-text h3{font-size:1.4rem;font-weight:700;color:#f7f7ff;margin-bottom:12px;letter-spacing:-.01em}
    .feature-text p{font-size:.88rem;color:#94a3b8;line-height:1.7;margin-bottom:20px}
    .feature-link{font-size:.82rem;font-weight:600;color:#b84cff;transition:color .15s;cursor:pointer}
    .feature-link:hover{color:#d09fff}
    .feature-link::after{content:' →'}
    .code-compare{display:grid;grid-template-columns:1fr 1fr;gap:14px}
    .code-box{background:#060b14;border:1px solid rgba(255,255,255,.07);border-radius:12px;overflow:hidden;transition:border-color .2s}
    .code-box:hover{border-color:rgba(139,77,255,.15)}
    .code-box-header{padding:10px 18px;font-size:.66rem;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.08em;border-bottom:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.01)}
    .code-box-header span{font-weight:600}
    .code-box-body{padding:18px 20px;overflow-x:auto}
    .code-box-body pre{font-size:.72rem;line-height:1.85;color:#cbd5e1;font-family:'JetBrains Mono',monospace;white-space:pre;margin:0;tab-size:2}
    .code-highlight{color:#b84cff;font-weight:500}
    .code-keyword{color:#4d7cff}
    .code-string{color:#00dfff}
    @media(max-width:900px){.feature-showcase{grid-template-columns:1fr;gap:32px}}

    /* === FEATURES GRID === */
    .features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:48px}
    .feature-card{background:#0a0f1a;border:1px solid rgba(255,255,255,.05);border-radius:14px;padding:28px;transition:border-color .2s,transform .2s}
    .feature-card:hover{border-color:rgba(139,77,255,.2);transform:translateY(-2px)}
    .feature-card-icon{font-size:1.4rem;margin-bottom:16px;width:44px;height:44px;display:flex;align-items:center;justify-content:center;background:rgba(139,77,255,.08);border-radius:10px}
    .feature-card h4{font-size:.95rem;font-weight:700;color:#f7f7ff;margin-bottom:8px;letter-spacing:-.01em}
    .feature-card p{font-size:.8rem;color:#64748b;line-height:1.6}
    @media(max-width:900px){.features-grid{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:600px){.features-grid{grid-template-columns:1fr}}

    /* === HOW IT WORKS === */
    .steps{display:flex;gap:20px;margin-top:48px;position:relative}
    .steps::before{content:'';position:absolute;top:40px;left:0;right:0;height:1px;background:linear-gradient(90deg,rgba(139,77,255,.3),rgba(0,223,255,.3),rgba(139,77,255,.3))}
    .step{flex:1;text-align:center;position:relative;z-index:1}
    .step-num{width:80px;height:80px;margin:0 auto 16px;border-radius:50%;background:#0a0f1a;border:2px solid rgba(139,77,255,.2);display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:800;color:#b84cff}
    .step h4{font-size:.88rem;font-weight:700;color:#f7f7ff;margin-bottom:6px}
    .step p{font-size:.76rem;color:#64748b;line-height:1.5}
    @media(max-width:768px){.steps{flex-direction:column;gap:24px}.steps::before{display:none}}

    /* === CODE TABS === */
    .code-tabs{margin-top:48px}
    .tabs-nav{display:flex;gap:2px;margin-bottom:0}
    .tab-btn{padding:10px 24px;font-size:.78rem;font-weight:600;color:#475569;background:rgba(255,255,255,.02);border:1px solid transparent;border-bottom:none;border-radius:10px 10px 0 0;cursor:pointer;transition:color .15s,background .15s,border-color .15s;letter-spacing:.01em}
    .tab-btn:hover{color:#94a3b8;background:rgba(255,255,255,.03)}
    .tab-btn.active{color:#b84cff;background:#060b14;border-color:rgba(255,255,255,.07);border-bottom-color:#060b14;position:relative;z-index:1}
    .tab-content{background:#060b14;border:1px solid rgba(255,255,255,.07);border-radius:0 12px 12px 12px;padding:28px;overflow-x:auto}
    .tab-content pre{font-size:.78rem;line-height:1.85;color:#cbd5e1;font-family:'JetBrains Mono',monospace;white-space:pre;margin:0;tab-size:2}
    .hl-kw{color:#b84cff}
    .hl-str{color:#00dfff}
    .hl-fn{color:#4d7cff}
    .hl-cmt{color:#475569}
    .hl-num{color:#f59e0b}

    /* === DASHBOARD PREVIEW === */
    .dashboard-preview{background:#060b14;border:1px solid rgba(255,255,255,.07);border-radius:16px;overflow:hidden;margin-top:48px}
    .dash-header{padding:14px 24px;border-bottom:1px solid rgba(255,255,255,.06);display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.01);flex-wrap:wrap}
    .dash-logo{font-family:'Fauna Pro',serif;font-weight:700;color:#f7f7ff;font-size:.9rem;display:flex;align-items:center;gap:8px}
    .dash-logo img{height:22px;width:auto}
    .dash-nav{display:flex;gap:4px;margin-left:16px;flex-wrap:wrap}
    .dash-nav-item{font-size:.74rem;color:#475569;font-weight:500;padding:5px 12px;border-radius:6px;cursor:pointer;transition:color .12s,background .12s;border:none;background:transparent}
    .dash-nav-item:hover{color:#94a3b8;background:rgba(255,255,255,.03)}
    .dash-nav-item.active{color:#b84cff;background:rgba(139,77,255,.1)}
    .dash-search{margin-left:auto;display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:8px;padding:5px 12px;font-size:.74rem;color:#94a3b8;min-width:160px}
    .dash-search input{background:none;border:none;color:#e2e8f0;font-size:.74rem;outline:none;width:100%;font-family:'Inter',sans-serif}
    .dash-search input::placeholder{color:#475569}
    .dash-body{display:grid;grid-template-columns:1fr 300px;min-height:420px}
    .dash-main{padding:24px}
    .dash-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
    .dash-stat{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:12px;padding:18px 20px;cursor:pointer;transition:border-color .15s,background .15s;user-select:none}
    .dash-stat:hover{border-color:rgba(139,77,255,.2);background:rgba(139,77,255,.04)}
    .dash-stat-val{font-size:1.3rem;font-weight:800;color:#f7f7ff;letter-spacing:-.01em}
    .dash-stat-lbl{font-size:.7rem;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px}
    .dash-stat-up{font-size:.68rem;color:#34d399;margin-top:4px;font-weight:600}
    .dash-period{display:flex;align-items:center;gap:8px;margin-bottom:12px}
    .dash-period-btn{font-size:.66rem;font-weight:600;color:#475569;padding:4px 10px;border-radius:5px;cursor:pointer;border:1px solid transparent;background:transparent;transition:color .12s,background .12s,border-color .12s}
    .dash-period-btn:hover{color:#94a3b8}
    .dash-period-btn.active{color:#b84cff;background:rgba(139,77,255,.08);border-color:rgba(139,77,255,.15)}
    .dash-chart-label{font-size:.7rem;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between}
    .dash-chart-refresh{font-size:.66rem;color:#475569;cursor:pointer;padding:3px 8px;border-radius:4px;border:none;background:rgba(255,255,255,.03);transition:color .12s,background .12s}
    .dash-chart-refresh:hover{color:#94a3b8;background:rgba(255,255,255,.06)}
    .dash-chart{background:rgba(255,255,255,.015);border-radius:10px;height:200px;display:flex;align-items:flex-end;gap:5px;padding:16px 12px;position:relative}
    .chart-bar{flex:1;background:linear-gradient(180deg,#b84cff,#4d7cff);border-radius:4px 4px 0 0;cursor:pointer;transition:opacity .15s,filter .15s;min-height:4px;position:relative}
    .chart-bar:hover{filter:brightness(1.3)}
    .chart-bar.selected{filter:brightness(1.4);box-shadow:0 0 12px rgba(184,76,255,.4)}
    .chart-tooltip{position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);background:#1a1030;border:1px solid rgba(184,76,255,.3);border-radius:6px;padding:4px 10px;font-size:.66rem;font-weight:600;color:#f7f7ff;white-space:nowrap;pointer-events:none;z-index:10}
    .dash-sidebar{background:rgba(255,255,255,.015);border-left:1px solid rgba(255,255,255,.06);padding:20px;display:flex;flex-direction:column}
    .dash-side-title{font-size:.68rem;font-weight:700;color:#475569;text-transform:uppercase;margin-bottom:14px;letter-spacing:.06em}
    .dash-product{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.03);font-size:.78rem;cursor:pointer;transition:color .12s}
    .dash-product:hover{color:#f7f7ff}
    .dash-product-name{color:#94a3b8}
    .dash-product-price{font-weight:600;color:#f7f7ff;font-size:.8rem}
    .dash-product-sales{font-size:.66rem;color:#64748b;margin-left:8px}
    .dash-empty{text-align:center;padding:20px;font-size:.76rem;color:#475569}
    @media(max-width:768px){.dash-body{grid-template-columns:1fr}.dash-stats{grid-template-columns:repeat(2,1fr)}.dash-search{min-width:120px}}

    /* === CTA === */
    .cta-section{text-align:center;padding:80px 0}
    .cta-section h2{font-size:2rem;font-weight:800;color:#f7f7ff;margin-bottom:12px;letter-spacing:-.02em}
    .cta-section p{font-size:.92rem;color:#64748b;margin-bottom:32px;max-width:500px;margin-left:auto;margin-right:auto}
    .cta-code{display:inline-flex;align-items:center;gap:12px;background:#0a0f1a;border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:.82rem;color:#cbd5e1;margin-bottom:24px}
    .cta-code span{color:#8d4dff}
  `;

  return (
    <div class="home-page">
      <style>{style}</style>

      {/* ── HERO ── */}
      <section class="hero">
        <div class="hero-bg"></div>
        <div class="stars">
          {/* Generate twinkling stars */}
          {(() => {
            const stars: JSX.Element[] = [];
            const colors = ['', 'purple', 'purple', 'cyan', 'cyan', ''];
            const sizes = ['small', 'small', 'small', 'medium', 'medium', 'large'];
            for (let i = 0; i < 60; i++) {
              const x = Math.random() * 100;
              const y = Math.random() * 100;
              const dur = 1.5 + Math.random() * 4;
              const delay = Math.random() * 5;
              const color = colors[Math.floor(Math.random() * colors.length)]!;
              const size = sizes[Math.floor(Math.random() * sizes.length)]!;
              stars.push(
                <div
                  class={`star ${color} ${size}`}
                  style={`left:${x}%;top:${y}%;--dur:${dur}s;--delay:${delay}s`}
                />
              );
            }
            return stars;
          })()}
        </div>
        <div class="container">
          <div class="hero-logo">
            <img src="/images/logo.png" alt="AstraJS Logo" />
          </div>
          <h1 class="hero-brand">ASTRA<span style="background:linear-gradient(135deg,#8d4dff,#4d7cff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">JS</span></h1>
          <p class="hero-tagline">The Full-Stack Framework<br/>that Ships Zero <span style="background:linear-gradient(135deg,#8d4dff,#4d7cff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">JavaScript</span>.</p>
          <p class="hero-sub">AstraJS elimina el Virtual DOM y compila tu código TypeScript a mutaciones directas del DOM. Más rápido, más ligero, más simple.</p>
          <div class="hero-buttons">
            <button class="btn-primary" onclick={() => navigate('/docs')}>
              Comenzar ahora <span>→</span>
            </button>
            <a class="btn-secondary" href="https://github.com" target="_blank" rel="noopener">
              <span>⌂</span> Ver en GitHub
            </a>
          </div>
        </div>
        <div class="scroll-down" onclick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}>
          <span>Discover more</span>
          <div class="scroll-down-arrow"></div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div class="container">
        <div class="stats-bar">
          <div class="stat-item">
            <div class="stat-num gradient">0KB</div>
            <div class="stat-desc">JS innecesario</div>
          </div>
          <div class="stat-item">
            <div class="stat-num gradient">Fine-grained</div>
            <div class="stat-desc">Reactivity</div>
          </div>
          <div class="stat-item">
            <div class="stat-num gradient">Zero Config</div>
            <div class="stat-desc">Type Inference</div>
          </div>
          <div class="stat-item">
            <div class="stat-num gradient">SSR • SSG • ISR</div>
            <div class="stat-desc">Built-in</div>
          </div>
        </div>
      </div>

      {/* ── FEATURE: Sin Virtual DOM ── */}
      <section class="section">
        <div class="section-inner">
          <div class="feature-showcase">
            <div class="feature-text">
              <div class="section-label">Sin Virtual DOM</div>
              <h3>Sin Virtual DOM.<br/>Actualizaciones quirúrgicas.</h3>
              <p>AstraJS convierte tu JSX en DOM nativo en tiempo de compilación y suscribe únicamente los nodos que cambian. <strong>O(1)</strong> actualizaciones. Máxima velocidad.</p>
              <Link href="/docs" class="feature-link">Saber más sobre la reactividad</Link>
            </div>
            <div class="code-compare">
              <div class="code-box">
                <div class="code-box-header">Tú escribes <span style="color:#b84cff">TypeScript • JSX</span></div>
                <div class="code-box-body">
                  <pre><span class="code-keyword">function</span> <span class="code-highlight">Counter</span>() {'{'}</pre>
                  <pre>    <span class="code-keyword">const</span> state = <span class="code-highlight">store</span>({'{'} count: 0 {'}'});</pre>
                  <pre>    <span class="code-keyword">return</span> (</pre>
                  <pre>        {'<button'} onclick={'{() =>'} state.count++{'}>'}</pre>
                  <pre>            Count: {'{'}state.count{'}'}</pre>
                  <pre>        {'</button>'}</pre>
                  <pre>    );</pre>
                  <pre>{'}'}</pre>
                </div>
              </div>
              <div class="code-box">
                <div class="code-box-header">AstraJS <span style="color:#00dfff">DOM nativo • suscripciones</span></div>
                <div class="code-box-body">
                  <pre><span class="code-keyword">const</span> btn = <span class="code-highlight">document.createElement</span>(<span class="code-string">'button'</span>);</pre>
                  <pre><span class="code-keyword">const</span> text = <span class="code-highlight">document.createTextNode</span>(<span class="code-string">''</span>);</pre>
                  <pre>btn.append(<span class="code-string">' '</span>, text);</pre>
                  <pre> </pre>
                  <pre><span class="code-highlight">effect</span>(() ={'>'} {'{'}</pre>
                  <pre>    nodeValue = <span class="code-string">\`Count: {'${state.count}'}\`</span>;</pre>
                  <pre>{'}'});</pre>
                  <pre> </pre>
                  <pre>btn.addEventListener(<span class="code-string">'click'</span>, () ={'>'} state.count++);</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section class="section" style="padding-top:0">
        <div class="section-inner">
          <div class="section-label">Todo lo que necesitas</div>
          <h2 class="section-title">Sin configuración.<br/>AstraJS es full-stack por defecto.</h2>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-card-icon">⚡</div>
              <h4>Compilación AST Avanzada</h4>
              <p>Tu código se transforma en mutaciones directas del DOM, extrayendo estilos, rutas y consultas en tiempo de build.</p>
            </div>
            <div class="feature-card">
              <div class="feature-card-icon">🎯</div>
              <h4>Reactividad de grano fino</h4>
              <p>Basada en Proxies de ES6. Cada propiedad se vincula al nodo exacto que la usa. Sin re-ejecución de componentes.</p>
            </div>
            <div class="feature-card">
              <div class="feature-card-icon">⚙️</div>
              <h4>Server Functions</h4>
              <p>RPC tipado con server. Caching, revalidación e invalidación quirúrgica con etiquetas.</p>
            </div>
            <div class="feature-card">
              <div class="feature-card-icon">🌐</div>
              <h4>SSR, SSG e ISR</h4>
              <p>Renderizado, generación estática e incremental transparentes. 0 JS para páginas estáticas.</p>
            </div>
            <div class="feature-card">
              <div class="feature-card-icon">📐</div>
              <h4>Layouts Persistentes</h4>
              <p>Router isomórfico con &lt;Outlet /&gt;. Preserva estado entre rutas y soporta View Transitions API.</p>
            </div>
            <div class="feature-card">
              <div class="feature-card-icon">🔮</div>
              <h4>Inferencia de Tipos Extrema</h4>
              <p>100% inferido de extremo a extremo. Seguridad de tipos estricta sin escribir tipos redundantes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section class="section" style="background:rgba(255,255,255,.01)">
        <div class="section-inner" style="text-align:center">
          <div class="section-label">¿Cómo funciona?</div>
          <h2 class="section-title">Escribes. Compilamos. Entregamos.</h2>
          <div class="steps">
            <div class="step">
              <div class="step-num">1</div>
              <h4>Escribes en TypeScript</h4>
              <p>Usas JSX, stores, server, css`` y el Router.</p>
            </div>
            <div class="step">
              <div class="step-num">2</div>
              <h4>Astra Compiler (AST)</h4>
              <p>Transforma JSX a DOM nativo, extrae CSS y optimiza consultas.</p>
            </div>
            <div class="step">
              <div class="step-num">3</div>
              <h4>Build / Pre-build</h4>
              <p>Pre-renderiza lo estático. Inyecta estado en HTML. (Zero JS).</p>
            </div>
            <div class="step">
              <div class="step-num">4</div>
              <h4>Entrega ultra rápida</h4>
              <p>HTML + CSS + JS mínimo (Just-In-Time). Resumible al instante.</p>
            </div>
            <div class="step">
              <div class="step-num">5</div>
              <h4>Interactividad JIT</h4>
              <p>Eventos y chunks se cargan solo cuando el usuario interactúa.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CODE PREVIEW ── */}
      <section class="section">
        <div class="section-inner">
          <div class="section-label">Un vistazo al código</div>
          <h2 class="section-title">Store · server · CSS · Router</h2>
          <div class="code-tabs">
            <div class="tabs-nav">
              {(['store','server','css','router'] as const).map(tab => (
                <button class={`tab-btn${tabsState.activeTab === tab ? ' active' : ''}`} onclick={() => { tabsState.activeTab = tab; }}>
                  {tab === 'server' ? 'server' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div class="tab-content">
              <pre>{tabCode[tabsState.activeTab]}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ── */}
      <section class="section" style="padding-top:0">
        <div class="section-inner">
          <div class="section-label">Ejemplo</div>
          <h2 class="section-title">Dashboard E-commerce</h2>
          <p style="font-size:.84rem;color:#64748b;margin-bottom:8px">Construido con <code style="background:rgba(139,77,255,.1);color:#c4a0ff;padding:2px 6px;border-radius:4px;font-size:.78rem">store()</code> de AstraJS — cada interacción actualiza solo los nodos necesarios.</p>
          <div class="dashboard-preview">
            <div class="dash-header">
              <span class="dash-logo">
                <img src="/images/logo.png" alt="A" />
                Dashboard
              </span>
              <div class="dash-nav">
                {navItems.map(item => (
                  <button
                    class={`dash-nav-item${dash.activeNav === item ? ' active' : ''}`}
                    onclick={() => { dash.activeNav = item; }}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div class="dash-search">
                <span>🔍</span>
                <input
                  placeholder="Search products..."
                  onInput={(e: Event) => { dash.search = (e.target as HTMLInputElement).value; }}
                />
              </div>
            </div>
            <div class="dash-body">
              <div class="dash-main">
                <div class="dash-period">
                  {periods.map((p, i) => (
                    <button
                      class={`dash-period-btn${dash.period === i ? ' active' : ''}`}
                      onclick={() => { dash.period = i; }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <div class="dash-stats">
                  <div class="dash-stat" onclick={() => { dash.period = (dash.period + 1) % 3; }}>
                    <div class="dash-stat-lbl">Total Sales</div>
                    <div class="dash-stat-val">${getStatValue(54780)}</div>
                    <div class="dash-stat-up">↑ {getStatChange(12.3)}%</div>
                  </div>
                  <div class="dash-stat" onclick={() => { dash.period = (dash.period + 1) % 3; }}>
                    <div class="dash-stat-lbl">Orders</div>
                    <div class="dash-stat-val">{getStatValue(1428)}</div>
                    <div class="dash-stat-up">↑ {getStatChange(8.3)}%</div>
                  </div>
                  <div class="dash-stat" onclick={() => { dash.period = (dash.period + 1) % 3; }}>
                    <div class="dash-stat-lbl">Customers</div>
                    <div class="dash-stat-val">{getStatValue(3987)}</div>
                    <div class="dash-stat-up">↑ {getStatChange(8.2)}%</div>
                  </div>
                  <div class="dash-stat" onclick={() => { dash.period = (dash.period + 1) % 3; }}>
                    <div class="dash-stat-lbl">Conversion</div>
                    <div class="dash-stat-val">{getStatValue(2.43, 2)}%</div>
                    <div class="dash-stat-up">↑ {getStatChange(4.1)}%</div>
                  </div>
                </div>
                <div class="dash-chart-label">
                  <span>Sales over time</span>
                  <button class="dash-chart-refresh" onclick={randomizeChart}>↻ Refresh</button>
                </div>
                <div class="dash-chart">
                  {dash.chartData.map((h: number, i: number) => (
                    <div
                      class={`chart-bar${dash.selectedBar === i ? ' selected' : ''}`}
                      style={`height:${h}%`}
                      onclick={() => { dash.selectedBar = i; }}
                    >
                      {dash.selectedBar === i && (
                        <div class="chart-tooltip">Day {i + 1}: {h}%</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div class="dash-sidebar">
                <div class="dash-side-title">Top Products</div>
                {(() => {
                  const items = filteredProducts();
                  return items.length > 0
                    ? items.map(p => (
                        <div class="dash-product" onclick={() => { dash.search = ''; }}>
                          <span class="dash-product-name">{p.name}</span>
                          <span>
                            <span class="dash-product-price">${p.price.toFixed(2)}</span>
                            <span class="dash-product-sales">{p.sales} sold</span>
                          </span>
                        </div>
                      ))
                    : <div class="dash-empty">No products found</div>;
                })()}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section class="cta-section" style="background:rgba(255,255,255,.01)">
        <div class="container">
          <h2>Listo para construir el futuro de la web.</h2>
          <p>Rendimiento máximo. DX moderno. Zero compromisos.</p>
          <div class="cta-code">
            <span>pnpm create astra@latest</span>
          </div>
          <br/>
          <button class="btn-primary" onclick={() => navigate('/docs')} style="font-size:.92rem;padding:14px 36px">
            Instalar AstraJS <span>→</span>
          </button>
        </div>
      </section>
    </div>
  );
});
