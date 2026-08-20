import { component, store, dynamic, mounted } from 'astrajs.dev/core';
import { navigate } from 'astrajs.dev/router';
import { i18n } from '../i18n.js';
import { Icon } from '../components/icon.js';
import { CodeBlock } from '../components/code-block.js';

export const HomePage = component(() => {
  const tabsState = store({ activeTab: 'store' as 'store' | 'server' | 'css' | 'router' });

  /** Divide claves con <br/> en líneas para renderizarlas con salto real. */
  const br = (key: string) => i18n.t(key).split('<br/>');

  /** Spotlight: sigue el cursor dentro de una tarjeta vía CSS vars --mx/--my. */
  const onCardMove = (e: Event) => {
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  // ── Dashboard reactive state ──
  const dash = store({
    activeNav: 'home.dash.overview' as string,
    period: 0, // 0=Today, 1=Week, 2=Month
    search: '',
    chartData: [60,75,45,90,55,80,70,95,65,85,50,72,88,68,92,78,62,85,95,72],
    selectedBar: -1,
    orders: [
      { id: '#10241', customer: 'Ana Torres', total: 129.99, paid: true },
      { id: '#10240', customer: 'Luis Vega', total: 89.5, paid: true },
      { id: '#10239', customer: 'Marta Ruiz', total: 312, paid: false },
      { id: '#10238', customer: 'Carlos Peña', total: 47.2, paid: true },
      { id: '#10237', customer: 'Sofía Gil', total: 199.99, paid: false },
    ],
    customers: [
      { name: 'Ana Torres', country: 'México' },
      { name: 'Luis Vega', country: 'España' },
      { name: 'Marta Ruiz', country: 'Colombia' },
      { name: 'Carlos Peña', country: 'Chile' },
      { name: 'Sofía Gil', country: 'Argentina' },
    ],
    settings: { notif: true, mail: false, dark: true },
    products: [
      { name: 'Wireless Headphones', price: 42.50, sales: 1240 },
      { name: 'Mechanical Keyboard', price: 3120, sales: 890 },
      { name: 'USB-C Hub', price: 2900, sales: 756 },
      { name: 'Smart Watch', price: 2430, sales: 632 },
      { name: 'Webcam 4K', price: 189, sales: 510 },
      { name: 'Monitor 27"', price: 449, sales: 423 },
    ],
  });

  const periods = ['home.dash.today', 'home.dash.week', 'home.dash.month'];
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

  const navItems = [
    'home.dash.overview',
    'home.dash.orders',
    'home.dash.products',
    'home.dash.customers',
    'home.dash.analytics',
    'home.dash.settings',
  ];
  const allProducts = dash.products;

  const randomizeChart = () => {
    dash.chartData = Array.from({ length: 20 }, () => Math.floor(Math.random() * 85 + 15));
  };

  // ── Number ticker (dashboard) ──
  const dashTicker = store({ sales: 0, orders: 0, customers: 0, conversion: 0 });
  let tickerRAF: number | null = null;
  let dashEl: HTMLElement | null = null;

  const animateTicker = () => {
    const targets = {
      sales: 54780 * periodMultiplier[dash.period],
      orders: 1428 * periodMultiplier[dash.period],
      customers: 3987 * periodMultiplier[dash.period],
      conversion: 2.43 * periodMultiplier[dash.period],
    };
    const from = { ...dashTicker };
    const start = performance.now();
    const dur = 1100;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      dashTicker.sales = from.sales + (targets.sales - from.sales) * e;
      dashTicker.orders = from.orders + (targets.orders - from.orders) * e;
      dashTicker.customers = from.customers + (targets.customers - from.customers) * e;
      dashTicker.conversion = from.conversion + (targets.conversion - from.conversion) * e;
      if (p < 1) tickerRAF = requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // ── CTA copy ──
  const ctaCopy = store({ copied: false });
  const copyCommand = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('npx astrajs.dev@latest my-app').catch(() => {});
    }
    ctaCopy.copied = true;
    setTimeout(() => { ctaCopy.copied = false; }, 1500);
  };

  // ── Scroll-reveal global + ticker on view ──
  mounted(() => {
    const revealEls = document.querySelectorAll('.reveal');
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('revealed');
          revealObs.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach((el) => revealObs.observe(el));

    const tickerObs = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        animateTicker();
        tickerObs.disconnect();
      }
    }, { threshold: 0.3 });
    if (dashEl) tickerObs.observe(dashEl);

    return () => { revealObs.disconnect(); tickerObs.disconnect(); if (tickerRAF) cancelAnimationFrame(tickerRAF); };
  });

  const tabCode: Record<string, string> = {
    store: `import { store } from 'astrajs.dev/core';

const state = store({
    products: [] as Product[],
    total: 0
});

// Mutating is reactive — the DOM updates itself.
state.products.push({ id: 1, name: 'Astra' });
state.total += 1;`,
    server: `import { server } from 'astrajs.dev/server';

export const loadProducts = server(async () => {
    return db.product.findMany();
});

// Usage — call it anywhere in the client:
const products = await loadProducts();
// products is Product[] — the type is inferred from the server`,
    css: `import { css } from 'astrajs.dev/compiler/css';

const cardStyle = css\`
    background: #0f172a;
    border: 1px solid #1e293b;
    border-radius: 14px;
    padding: 24px;

    &:hover {
        border-color: #818cf8;
    }
\`;`,
    router: `import { route, Link, Outlet } from 'astrajs.dev/router';

// app.tsx — route() is reactive: active route ⇒ component.
// No routes file, no config, no switch.
function App() {
    return (
        <main>
            {route('/', { exact: true }) && <Dashboard />}
            {route('/products') && <Products />}
            {route('/admin') && <Admin />}

            <Link href="/admin">Go to Admin</Link>
        </main>
    );
}`,
  };

  const tabComments: Record<string, string | undefined> = {
    store: 'home.store',
    server: 'home.server',
    css: undefined,
    router: 'home.router',
  };

  const style = `
    /* === HERO === */
    .hero{position:relative;overflow:hidden;min-height:calc(100vh - 64px);text-align:center;display:flex;align-items:center;justify-content:flex-start;flex-direction:column;padding-top:16vh}
    .hero .container{position:relative;z-index:1}
    .hero-bg{position:absolute;inset:0;pointer-events:none;background:url('/images/bg.png') center/cover no-repeat;opacity:.50}
    .hero-bg::before{content:'';position:absolute;top:-40%;left:50%;transform:translateX(-50%);width:900px;height:900px;background:radial-gradient(circle,rgba(139,77,255,.08) 0%,transparent 70%)}
    .hero-bg::after{content:'';position:absolute;bottom:-30%;left:50%;transform:translateX(-50%);width:700px;height:700px;background:radial-gradient(circle,rgba(0,223,255,.05) 0%,transparent 70%)}

    /* === AURORA (animated gradient blobs) === */
    .aurora{position:absolute;border-radius:50%;filter:blur(90px);opacity:.55;pointer-events:none;will-change:transform}
    .aurora-1{width:640px;height:640px;background:radial-gradient(circle,rgba(139,77,255,.4) 0%,transparent 70%);top:-12%;left:-6%;animation:auroraFloat 18s ease-in-out infinite}
    .aurora-2{width:540px;height:540px;background:radial-gradient(circle,rgba(0,223,255,.26) 0%,transparent 70%);bottom:-16%;right:-8%;animation:auroraFloat 24s ease-in-out infinite reverse}
    .aurora-3{width:440px;height:440px;background:radial-gradient(circle,rgba(77,124,255,.3) 0%,transparent 70%);top:42%;left:56%;animation:auroraFloat 28s ease-in-out infinite}
    @keyframes auroraFloat{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(46px,-34px) scale(1.08)}66%{transform:translate(-34px,28px) scale(.94)}}

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
    .stats-bar{display:flex;justify-content:center;flex-wrap:wrap;gap:40px 64px;padding:56px 0;border-top:1px solid rgba(255,255,255,.05);border-bottom:1px solid rgba(255,255,255,.05);margin-bottom:80px}
    .stat-item{text-align:center;display:flex;flex-direction:column;align-items:center}
    .stat-icon{width:58px;height:58px;border-radius:16px;background:rgba(139,77,255,.08);border:1px solid rgba(139,77,255,.16);display:flex;align-items:center;justify-content:center;margin-bottom:14px;box-shadow:0 0 24px rgba(139,77,255,.12)}
    .stat-icon img{width:30px;height:30px}
    .stat-num{font-size:1.35rem;font-weight:800;color:#f7f7ff;letter-spacing:-.01em;display:flex;align-items:center;justify-content:center;gap:7px;margin-bottom:5px}
    .stat-num .grad-text{background:linear-gradient(135deg,#b84cff,#4d7cff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
    .stat-desc{font-size:.76rem;color:#64748b;font-weight:500;display:flex;align-items:center;justify-content:center;gap:6px}
    @media(max-width:640px){.stats-bar{gap:28px 36px}}

    /* === SCROLL REVEAL === */
    .reveal{opacity:0;transform:translateY(26px);transition:opacity .7s cubic-bezier(.16,1,.3,1),transform .7s cubic-bezier(.16,1,.3,1)}
    .reveal.revealed{opacity:1;transform:none}
    @media (prefers-reduced-motion: reduce){.reveal{opacity:1;transform:none;transition:none}}

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
    @media(max-width:900px){.feature-showcase{grid-template-columns:1fr;gap:32px}}

    /* === INCREMENTAL === */
    .incremental{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;margin-top:48px}
    .incremental-visual{display:flex;flex-direction:column;gap:14px}
    .inc-level{display:flex;align-items:center;gap:12px;padding:16px 20px;border-radius:12px;background:#0a0f1a;border:1px solid rgba(255,255,255,.06);font-size:.9rem;font-weight:600;color:#e2e8f0;transition:border-color .2s,transform .2s}
    .inc-level svg{color:#b84cff;flex-shrink:0}
    .inc-level:hover{border-color:rgba(139,77,255,.3);transform:translateX(4px)}
    .inc-level.inc-1{border-color:rgba(139,77,255,.35)}
    .inc-level.inc-2{margin-left:24px}
    .inc-level.inc-3{margin-left:48px}
    .inc-level.inc-4{margin-left:72px}
    .inc-level.inc-5{margin-left:96px}
    .incremental-text p{font-size:.92rem;color:#94a3b8;line-height:1.7;max-width:520px}
    @media(max-width:900px){.incremental{grid-template-columns:1fr;gap:32px}.inc-level{margin-left:0!important}}

    /* === FEATURES GRID (uniform + spotlight) === */
    .features-grid{display:grid;grid-template-columns:repeat(3,1fr);grid-auto-rows:minmax(210px,auto);gap:20px;margin-top:48px}
    .feature-card{position:relative;overflow:hidden;background:#0a0f1a;border:1px solid rgba(255,255,255,.05);border-radius:14px;padding:28px;transition:border-color .2s,transform .2s;min-height:210px}
    .feature-card:hover{border-color:rgba(139,77,255,.25);transform:translateY(-3px)}
    .feature-card::before{content:'';position:absolute;inset:0;background:radial-gradient(260px circle at var(--mx,50%) var(--my,50%),rgba(139,77,255,.16),transparent 60%);opacity:0;transition:opacity .25s;pointer-events:none}
    .feature-card:hover::before{opacity:1}
    .feature-card::after{content:'';position:absolute;inset:0;border-radius:inherit;padding:1px;background:linear-gradient(135deg,rgba(139,77,255,.55),rgba(0,223,255,.3));-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:0;transition:opacity .25s;pointer-events:none}
    .feature-card:hover::after{opacity:1}
    .feature-card-icon{font-size:1.6rem;margin-bottom:18px;width:60px;height:60px;display:flex;align-items:center;justify-content:center;background:rgba(139,77,255,.1);border-radius:14px;position:relative;z-index:1}
    .feature-card-icon img{width:32px;height:32px}
    .feature-card h4{font-size:.95rem;font-weight:700;color:#f7f7ff;margin-bottom:8px;letter-spacing:-.01em;position:relative;z-index:1}
    .feature-card p{font-size:.8rem;color:#94a3b8;line-height:1.6;position:relative;z-index:1}
    @media(max-width:900px){.features-grid{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:600px){.features-grid{grid-template-columns:1fr}}

    /* === HOW IT WORKS === */
    .steps{display:flex;gap:20px;margin-top:48px;position:relative}
    .steps::before{content:'';position:absolute;top:40px;left:0;right:0;height:1px;background:linear-gradient(90deg,rgba(139,77,255,.3),rgba(0,223,255,.3),rgba(139,77,255,.3))}
    .step{flex:1;text-align:center;position:relative;z-index:1}
    .step-num{width:80px;height:80px;margin:0 auto 16px;border-radius:50%;background:#0a0f1a;border:2px solid rgba(139,77,255,.2);display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:800;color:#b84cff;position:relative}
    .step-idx{position:absolute;top:-5px;right:-5px;width:21px;height:21px;border-radius:50%;background:linear-gradient(135deg,#8d4dff,#4d7cff);color:#fff;font-size:.62rem;font-weight:800;display:flex;align-items:center;justify-content:center;border:2px solid #060b14}
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
    .dash-panel-title{font-size:.72rem;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px}
    .dash-list{display:flex;flex-direction:column;gap:4px}
    .dash-list-row{display:flex;align-items:center;gap:14px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:10px;padding:10px 14px;font-size:.78rem;transition:border-color .15s}
    .dash-list-row:hover{border-color:rgba(139,77,255,.2)}
    .dash-row-id{color:#64748b;font-weight:600;font-family:'JetBrains Mono',monospace;font-size:.72rem;min-width:56px}
    .dash-row-name{color:#e2e8f0;flex:1}
    .dash-row-total{color:#f7f7ff;font-weight:600}
    .dash-badge{font-size:.62rem;font-weight:700;padding:2px 10px;border-radius:10px;color:#b84cff;background:rgba(139,77,255,.1);border:1px solid rgba(139,77,255,.2)}
    .dash-badge.paid{color:#34d399;background:rgba(52,211,153,.08);border-color:rgba(52,211,153,.2)}
    .dash-badge.pending{color:#fbbf24;background:rgba(251,191,36,.08);border-color:rgba(251,191,36,.2)}
    .dash-toggle{width:34px;height:18px;border-radius:10px;background:rgba(255,255,255,.1);position:relative;transition:background .15s;flex-shrink:0}
    .dash-toggle::after{content:'';position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:#94a3b8;transition:left .15s,background .15s}
    .dash-toggle.on{background:linear-gradient(135deg,#8d4dff,#4d7cff)}
    .dash-toggle.on::after{left:18px;background:#fff}
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
    .cta-section{position:relative;text-align:center;padding:0;min-height:60vh;display:flex;align-items:center;justify-content:center}
    .cta-section .container{position:relative;z-index:1;width:100%}
    .cta-aurora{position:absolute;inset:0;pointer-events:none;z-index:0}
    .cta-aurora-1{background:radial-gradient(60% 60% at 50% 45%, rgba(139,77,255,.32), transparent 85%)}
    .cta-aurora-2{background:radial-gradient(50% 50% at 12% 85%, rgba(0,223,255,.16), transparent 85%)}
    .cta-aurora-3{background:radial-gradient(50% 50% at 88% 85%, rgba(77,124,255,.2), transparent 85%)}
    .cta-section h2{font-size:2rem;font-weight:800;color:#f7f7ff;margin-bottom:12px;letter-spacing:-.02em}
    .cta-section p{font-size:.92rem;color:#94a3b8;margin-bottom:32px;max-width:500px;margin-left:auto;margin-right:auto}
    .cta-code{position:relative;display:inline-flex;align-items:center;gap:12px;background:#0a0f1a;border-radius:10px;padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:.82rem;color:#cbd5e1;margin-bottom:24px;cursor:pointer}
    .cta-copy-tip{position:absolute;bottom:calc(100% + 10px);left:50%;transform:translateX(-50%) translateY(4px);background:#1a1030;border:1px solid rgba(184,76,255,.3);color:#f7f7ff;font-size:.66rem;font-weight:600;padding:4px 10px;border-radius:6px;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .15s,transform .15s;font-family:'Inter',sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.4)}
    .cta-code:hover .cta-copy-tip{opacity:1;transform:translateX(-50%) translateY(0)}
    .cta-copy-tip.copied{color:#34d399;border-color:rgba(52,211,153,.4)}
    .cta-code::before{content:'';position:absolute;inset:0;border-radius:inherit;padding:1px;background:linear-gradient(135deg,#8d4dff,#00dfff,#4d7cff,#8d4dff);background-size:200% 200%;-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:ctaBorder 6s linear infinite;pointer-events:none}
    @keyframes ctaBorder{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
    .cta-code span{color:#c4a0ff}
  `;

  return (
    <div class="home-page">
      <style>{style}</style>

      {/* ── HERO ── */}
      <section class="hero">
        <div class="hero-bg"></div>
        <div class="aurora aurora-1"></div>
        <div class="aurora aurora-2"></div>
        <div class="aurora aurora-3"></div>
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
          <p class="hero-tagline">{i18n.t('hero.tagline1')}<br/>{i18n.t('hero.tagline2')}<span style="background:linear-gradient(135deg,#8d4dff,#4d7cff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">{i18n.t('hero.tagline.js')}</span>.</p>
          <p class="hero-sub">{i18n.t('hero.sub')}</p>
          <div class="hero-buttons">
            <button class="btn-primary" onclick={() => navigate('/docs/introduction')}>
              {i18n.t('hero.start')} <Icon name="arrow-right" size={13} color="#fff" />
            </button>
            <a class="btn-secondary" href="https://github.com" target="_blank" rel="noopener">
              <Icon name="github" size={14} /> {i18n.t('hero.github')}
            </a>
          </div>
        </div>
        <div class="scroll-down" onclick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}>
          <span>{i18n.t('hero.discover')}</span>
          <div class="scroll-down-arrow"></div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div class="container">
        <div class="stats-bar">
          <div class="stat-item">
            <div class="stat-icon"><Icon name="js-off" size={30} /></div>
            <div class="stat-num"><span class="grad-text">0KB</span></div>
            <div class="stat-desc">{i18n.t('stats.unused')}</div>
          </div>
          <div class="stat-item">
            <div class="stat-icon"><Icon name="bolt" size={30} /></div>
            <div class="stat-num"><span class="grad-text">{i18n.t('stats.finegrained')}</span></div>
            <div class="stat-desc">{i18n.t('stats.reactivity')}</div>
          </div>
          <div class="stat-item">
            <div class="stat-icon"><Icon name="wrench" size={30} /></div>
            <div class="stat-num"><span class="grad-text">{i18n.t('stats.zeroconfig')}</span></div>
            <div class="stat-desc"><Icon name="sparkles" size={12} /> {i18n.t('stats.inference')}</div>
          </div>
          <div class="stat-item">
            <div class="stat-icon"><Icon name="ssr" size={30} /></div>
            <div class="stat-num"><span class="grad-text">SSR • SSG • ISR</span></div>
            <div class="stat-desc"><Icon name="check" size={12} /> {i18n.t('stats.builtin')}</div>
          </div>
        </div>
      </div>

      {/* ── FEATURE: Sin Virtual DOM ── */}
      <section class="section reveal" style="padding-top:0">
        <div class="section-inner">
          <div class="feature-showcase">
            <div class="feature-text">
              <div class="section-label">{i18n.t('home.novdom.label')}</div>
              <h3>{br('home.novdom.title')[0]}<br/>{br('home.novdom.title')[1]}</h3>
              <p>{i18n.t('home.novdom.text1')}<strong>O(1)</strong>{i18n.t('home.novdom.text2')}</p>
              <a href="/docs/fundamentals" class="feature-link" onclick={(e: Event) => { e.preventDefault(); navigate('/docs/fundamentals'); }}>{i18n.t('home.novdom.link')}</a>
            </div>
            <div class="code-compare">
              <div class="code-box" style="grid-column:1/-1">
                <div class="code-box-header"><span style="color:#b84cff">TypeScript • JSX</span></div>
                <div class="code-box-body">
                  <CodeBlock
                    bare
                    code={`function Counter() {
    const state = store({ count: 0 });
    return (
        <button onclick={() => state.count++}>
            Count: \${state.count}
        </button>
    );
}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── INCREMENTAL ── */}
      <section class="section reveal">
        <div class="section-inner">
          <div class="incremental">
            <div class="incremental-visual">
              <div class="inc-level inc-1"><Icon name="bolt" size={16} /> {i18n.t('home.incremental.l1')}</div>
              <div class="inc-level inc-2"><Icon name="server" size={16} /> {i18n.t('home.incremental.l2')}</div>
              <div class="inc-level inc-3"><Icon name="ssr" size={16} /> {i18n.t('home.incremental.l3')}</div>
              <div class="inc-level inc-4"><Icon name="route" size={16} /> {i18n.t('home.incremental.l4')}</div>
              <div class="inc-level inc-5"><Icon name="chip" size={16} /> {i18n.t('home.incremental.l5')}</div>
            </div>
            <div class="incremental-text">
              <div class="section-label">{i18n.t('home.incremental.label')}</div>
              <h2 class="section-title">{i18n.t('home.incremental.title')}</h2>
              <p>{i18n.t('home.incremental.text')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section class="section reveal" style="padding-top:0">
        <div class="section-inner">
          <div class="section-label">{i18n.t('home.features.label')}</div>
          <h2 class="section-title">{br('home.features.title')[0]}<br/>{br('home.features.title')[1]}</h2>
          <div class="features-grid">
            <div class="feature-card" onmousemove={onCardMove}>
              <div class="feature-card-icon"><Icon name="ast" size={32} /></div>
              <h4>{i18n.t('home.f1.title')}</h4>
              <p>{i18n.t('home.f1.text')}</p>
            </div>
            <div class="feature-card" onmousemove={onCardMove}>
              <div class="feature-card-icon"><Icon name="bolt" size={32} /></div>
              <h4>{i18n.t('home.f2.title')}</h4>
              <p>{i18n.t('home.f2.text')}</p>
            </div>
            <div class="feature-card" onmousemove={onCardMove}>
              <div class="feature-card-icon"><Icon name="server" size={32} /></div>
              <h4>{i18n.t('home.f3.title')}</h4>
              <p>{i18n.t('home.f3.text')}</p>
            </div>
            <div class="feature-card" onmousemove={onCardMove}>
              <div class="feature-card-icon"><Icon name="ssr" size={32} /></div>
              <h4>{i18n.t('home.f4.title')}</h4>
              <p>{i18n.t('home.f4.text')}</p>
            </div>
            <div class="feature-card" onmousemove={onCardMove}>
              <div class="feature-card-icon"><Icon name="layout-pages" size={32} /></div>
              <h4>{i18n.t('home.f5.title')}</h4>
              <p>{i18n.t('home.f5.text')}</p>
            </div>
            <div class="feature-card" onmousemove={onCardMove}>
              <div class="feature-card-icon"><Icon name="sparkles" size={32} /></div>
              <h4>{i18n.t('home.f6.title')}</h4>
              <p>{i18n.t('home.f6.text')}</p>
            </div>
            <div class="feature-card" onmousemove={onCardMove}>
              <div class="feature-card-icon"><Icon name="chip" size={32} /></div>
              <h4>{i18n.t('home.f7.title')}</h4>
              <p>{i18n.t('home.f7.text')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section class="section reveal" style="background:rgba(255,255,255,.01)">
        <div class="section-inner" style="text-align:center">
          <div class="section-label">{i18n.t('home.how.label')}</div>
          <h2 class="section-title">{i18n.t('home.how.title')}</h2>
          <div class="steps">
            <div class="step">
              <div class="step-num">
                <Icon name="code" size={26} />
                <span class="step-idx">1</span>
              </div>
              <h4>{i18n.t('home.step1.title')}</h4>
              <p>{i18n.t('home.step1.text')}</p>
            </div>
            <div class="step">
              <div class="step-num">
                <Icon name="ast" size={26} />
                <span class="step-idx">2</span>
              </div>
              <h4>{i18n.t('home.step2.title')}</h4>
              <p>{i18n.t('home.step2.text')}</p>
            </div>
            <div class="step">
              <div class="step-num">
                <Icon name="terminal" size={26} />
                <span class="step-idx">3</span>
              </div>
              <h4>{i18n.t('home.step3.title')}</h4>
              <p>{i18n.t('home.step3.text')}</p>
            </div>
            <div class="step">
              <div class="step-num">
                <Icon name="bolt" size={26} />
                <span class="step-idx">4</span>
              </div>
              <h4>{i18n.t('home.step4.title')}</h4>
              <p>{i18n.t('home.step4.text')}</p>
            </div>
            <div class="step">
              <div class="step-num">
                <Icon name="pointer" size={26} />
                <span class="step-idx">5</span>
              </div>
              <h4>{i18n.t('home.step5.title')}</h4>
              <p>{i18n.t('home.step5.text')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CODE PREVIEW ── */}
      <section class="section reveal">
        <div class="section-inner">
          <div class="section-label">{i18n.t('home.code.label')}</div>
          <h2 class="section-title">store · server · CSS · router</h2>
          <div class="code-tabs">
            <div class="tabs-nav">
              {(['store','server','css','router'] as const).map(tab => (
                <button class={`tab-btn${tabsState.activeTab === tab ? ' active' : ''}`} onclick={() => { tabsState.activeTab = tab; }}>
                  {tab}
                </button>
              ))}
            </div>
            <div class="tab-content">
              {(() => <CodeBlock bare code={tabCode[tabsState.activeTab]} commentsKey={tabComments[tabsState.activeTab]} />)()}
            </div>
          </div>
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ── */}
      <section class="section reveal" style="padding-top:0">
        <div class="section-inner">
          <div class="section-label">{i18n.t('home.demo.label')}</div>
          <h2 class="section-title">Dashboard E-commerce</h2>
          <p style="font-size:.84rem;color:#64748b;margin-bottom:8px">{i18n.t('home.demo.sub1')}<code style="background:rgba(139,77,255,.1);color:#c4a0ff;padding:2px 6px;border-radius:4px;font-size:.78rem">store()</code>{i18n.t('home.demo.sub2')}</p>
          <div class="dashboard-preview" ref={(n) => { dashEl = n; }}>
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
                    {i18n.t(item)}
                  </button>
                ))}
              </div>
              <div class="dash-search">
                <Icon name="search" size={13} cls="dash-search-ic" />
                <input
                  placeholder={i18n.t('home.dash.search')}
                  onInput={(e: Event) => { dash.search = (e.target as HTMLInputElement).value; }}
                />
              </div>
            </div>
            <div class="dash-body">
              <div class="dash-main">
                {dash.activeNav === 'home.dash.overview' && (
                  <div class="dash-panel">
                    <div class="dash-period">
                      {periods.map((p, i) => (
                        <button
                          class={`dash-period-btn${dash.period === i ? ' active' : ''}`}
                          onclick={() => { dash.period = i; animateTicker(); }}
                        >
                          {i18n.t(p)}
                        </button>
                      ))}
                    </div>
                    <div class="dash-stats">
                      <div class="dash-stat">
                        <div class="dash-stat-lbl">{i18n.t('home.dash.totalSales')}</div>
                        <div class="dash-stat-val">${Math.round(dashTicker.sales).toLocaleString()}</div>
                        <div class="dash-stat-up">↑ {getStatChange(12.3)}%</div>
                      </div>
                      <div class="dash-stat">
                        <div class="dash-stat-lbl">{i18n.t('home.dash.orders')}</div>
                        <div class="dash-stat-val">{Math.round(dashTicker.orders).toLocaleString()}</div>
                        <div class="dash-stat-up">↑ {getStatChange(8.3)}%</div>
                      </div>
                      <div class="dash-stat">
                        <div class="dash-stat-lbl">{i18n.t('home.dash.customers')}</div>
                        <div class="dash-stat-val">{Math.round(dashTicker.customers).toLocaleString()}</div>
                        <div class="dash-stat-up">↑ {getStatChange(8.2)}%</div>
                      </div>
                      <div class="dash-stat">
                        <div class="dash-stat-lbl">{i18n.t('home.dash.conversion')}</div>
                        <div class="dash-stat-val">{dashTicker.conversion.toFixed(2)}%</div>
                        <div class="dash-stat-up">↑ {getStatChange(4.1)}%</div>
                      </div>
                    </div>
                    <div class="dash-chart-label">
                      <span>{i18n.t('home.dash.chart')}</span>
                      <button class="dash-chart-refresh" onclick={randomizeChart}>↻ {i18n.t('home.dash.refresh')}</button>
                    </div>
                    <div class="dash-chart">
                      {dash.chartData.map((h: number, i: number) => (
                        <div
                          class={`chart-bar${dash.selectedBar === i ? ' selected' : ''}`}
                          style={`height:${h}%`}
                          onclick={() => { dash.selectedBar = i; }}
                        >
                          {dash.selectedBar === i && (
                            <div class="chart-tooltip">{i18n.t('home.dash.tooltip', { day: i + 1, value: h })}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {dash.activeNav === 'home.dash.orders' && (
                  <div class="dash-panel">
                    <div class="dash-panel-title">{i18n.t('dash.panel.orders')}</div>
                    <div class="dash-list">
                      {dash.orders.map((o) => (
                        <div class="dash-list-row">
                          <span class="dash-row-id">{o.id}</span>
                          <span class="dash-row-name">{o.customer}</span>
                          <span class="dash-row-total">${o.total.toFixed(2)}</span>
                          <span class={`dash-badge ${o.paid ? 'paid' : 'pending'}`}>{i18n.t(o.paid ? 'dash.status.paid' : 'dash.status.pending')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {dash.activeNav === 'home.dash.products' && (
                  <div class="dash-panel">
                    <div class="dash-panel-title">{i18n.t('dash.panel.products')}</div>
                    <div class="dash-list">
                      {dash.products.map((p) => (
                        <div class="dash-list-row">
                          <span class="dash-row-name">{p.name}</span>
                          <span class="dash-row-total">${p.price.toFixed(2)}</span>
                          <span class="dash-badge">{i18n.t('home.dash.sold', { count: p.sales })}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {dash.activeNav === 'home.dash.customers' && (
                  <div class="dash-panel">
                    <div class="dash-panel-title">{i18n.t('dash.panel.customers')}</div>
                    <div class="dash-list">
                      {dash.customers.map((c) => (
                        <div class="dash-list-row">
                          <span class="dash-row-name">{c.name}</span>
                          <span class="dash-row-total">{c.country}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {dash.activeNav === 'home.dash.analytics' && (
                  <div class="dash-panel">
                    <div class="dash-panel-title">{i18n.t('dash.panel.analytics')}</div>
                    <div class="dash-chart" style="height:260px">
                      {dash.chartData.map((h: number, i: number) => (
                        <div
                          class={`chart-bar${dash.selectedBar === i ? ' selected' : ''}`}
                          style={`height:${h}%`}
                          onclick={() => { dash.selectedBar = i; }}
                        >
                          {dash.selectedBar === i && (
                            <div class="chart-tooltip">{i18n.t('home.dash.tooltip', { day: i + 1, value: h })}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {dash.activeNav === 'home.dash.settings' && (
                  <div class="dash-panel">
                    <div class="dash-panel-title">{i18n.t('dash.panel.settings')}</div>
                    <div class="dash-list">
                      {(['notif', 'mail', 'dark'] as const).map((k) => (
                        <div class="dash-list-row" style="cursor:pointer" onclick={() => { dash.settings[k] = !dash.settings[k]; }}>
                          <span class="dash-row-name">{i18n.t(`dash.settings.${k}`)}</span>
                          <span class={`dash-toggle${dash.settings[k] ? ' on' : ''}`}></span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div class="dash-sidebar">
                <div class="dash-side-title">{i18n.t('home.dash.top')}</div>
                {(() => {
                  const items = filteredProducts();
                  return items.length > 0
                    ? items.map(p => (
                        <div class="dash-product" onclick={() => { dash.search = ''; }}>
                          <span class="dash-product-name">{p.name}</span>
                          <span>
                            <span class="dash-product-price">${p.price.toFixed(2)}</span>
                            <span class="dash-product-sales">{i18n.t('home.dash.sold', { count: p.sales })}</span>
                          </span>
                        </div>
                      ))
                    : <div class="dash-empty">{i18n.t('home.dash.empty')}</div>;
                })()}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section class="cta-section reveal" style="background:rgba(255,255,255,.01)">
        <div class="cta-aurora cta-aurora-1"></div>
        <div class="cta-aurora cta-aurora-2"></div>
        <div class="cta-aurora cta-aurora-3"></div>
        <div class="container">
          <h2>{i18n.t('home.cta.title')}</h2>
          <p>{i18n.t('home.cta.sub')}</p>
          <div class="cta-code" onclick={copyCommand}>
            <span>npx astrajs.dev@latest my-app</span>
            <span class={`cta-copy-tip${ctaCopy.copied ? ' copied' : ''}`}>{ctaCopy.copied ? i18n.t('cb.copied') : i18n.t('cb.copy')}</span>
          </div>
          <br/>
          <button class="btn-primary" onclick={() => navigate('/docs/introduction')} style="font-size:.92rem;padding:14px 36px">
            {i18n.t('home.cta.btn')} <Icon name="arrow-right" size={13} color="#fff" />
          </button>
        </div>
      </section>
    </div>
  );
});
