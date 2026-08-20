import { component, store, dynamic } from 'astrajs.dev/core';
import { navigate, onRouteChange } from 'astrajs.dev/router';
import { i18n } from '../i18n.js';
import { Icon } from './icon.js';

interface DocSection {
  /** Título literal (término técnico) o clave i18n cuando existe titleK. */
  title: string;
  titleK?: string;
  items: { label: string; k?: string; href: string }[];
  /** Mini-cards con icono (p. ej. sitios completos externos). */
  cards?: { icon: string; title: string; href: string }[];
}

const docSections: DocSection[] = [
  {
    title: 'Introducción',
    titleK: 'sb.intro',
    items: [
      { label: '', k: 'sb.what', href: '/docs/introduction' },
      { label: '', k: 'sb.install', href: '/docs/introduction#instalacion' },
      { label: '', k: 'sb.gettingStarted', href: '/docs/introduction#primeros-pasos' },
      { label: '', k: 'sb.keyConcepts', href: '/docs/introduction#conceptos-clave' },
    ],
  },
  {
    title: 'Fundamentos',
    titleK: 'sb.fund',
    items: [
      { label: '', k: 'sb.components', href: '/docs/fundamentals#componentes' },
      { label: '', k: 'sb.reactivity', href: '/docs/fundamentals#reactividad' },
      { label: '', k: 'sb.jsx', href: '/docs/fundamentals#jsx-sin-vdom' },
      { label: '', k: 'sb.css', href: '/docs/fundamentals#estilos' },
      { label: '', k: 'sb.events', href: '/docs/fundamentals#eventos' },
    ],
  },
  {
    title: 'Server & Data',
    items: [
      { label: 'server', href: '/docs/server-data#server' },
      { label: '', k: 'sb.serverTypes', href: '/docs/server-data#tipos-server' },
      { label: '', k: 'sb.caching', href: '/docs/server-data#caching' },
      { label: '', k: 'sb.autosync', href: '/docs/server-data#autosync' },
    ],
  },
  {
    title: 'Router',
    items: [
      { label: '', k: 'sb.routes', href: '/docs/router#rutas' },
      { label: '', k: 'sb.layouts', href: '/docs/router#layouts' },
      { label: '', k: 'sb.navigation', href: '/docs/router#navegacion' },
      { label: 'View Transitions API', href: '/docs/router#view-transitions' },
    ],
  },
  {
    title: 'Renderizado',
    titleK: 'sb.rendering',
    items: [
      { label: 'SSR', href: '/docs/rendering#ssr' },
      { label: 'SSG', href: '/docs/rendering#ssg' },
      { label: 'ISR', href: '/docs/rendering#isr' },
      { label: '', k: 'sb.resumability', href: '/docs/rendering#resumibilidad' },
    ],
  },
  {
    title: 'Ejemplos',
    titleK: 'sb.examples',
    items: [
      { label: '', k: 'sb.exFull', href: '/docs/examples#full' },
      { label: '', k: 'sb.exFrontend', href: '/docs/examples#frontend' },
      { label: '', k: 'sb.exBackend', href: '/docs/examples#backend' },
    ],
  },
  {
    title: 'Comparativa',
    titleK: 'sb.compare',
    items: [
      { label: '', k: 'sb.benchmarks', href: '/docs/comparison#benchmarks' },
      { label: 'React vs AstraJS', href: '/docs/comparison#react-vs' },
      { label: 'Vue.js vs AstraJS', href: '/docs/comparison#vue-vs' },
      { label: 'Angular vs AstraJS', href: '/docs/comparison#angular-vs' },
    ],
  },
  {
    title: 'CLI',
    items: [
      { label: '', k: 'sb.cliWhat', href: '/docs/cli#que-es' },
      { label: '', k: 'sb.cliCreate', href: '/docs/cli#crear-proyecto' },
      { label: '', k: 'sb.cliTemplates', href: '/docs/cli#plantillas' },
      { label: '', k: 'sb.cliOptions', href: '/docs/cli#opciones' },
    ],
  },
  {
    title: 'Pruebas',
    titleK: 'sb.testing',
    items: [
      { label: '', k: 'sb.testUnit', href: '/docs/testing#unitarias' },
      { label: '', k: 'sb.testJest', href: '/docs/testing#jest' },
      { label: '', k: 'sb.testPlaywright', href: '/docs/testing#e2e-playwright' },
      { label: '', k: 'sb.testCypress', href: '/docs/testing#e2e-cypress' },
      { label: 'server() RPC', href: '/docs/testing#server' },
      { label: '', k: 'sb.testCompare', href: '/docs/testing#comparativa' },
    ],
  },
  {
    title: 'i18n',
    items: [
      { label: '', k: 'sb.i18nDemo', href: '/docs/i18n#demo' },
      { label: '', k: 'sb.i18nSetup', href: '/docs/i18n#setup' },
      { label: '', k: 'sb.i18nInterp', href: '/docs/i18n#interpolacion' },
      { label: '', k: 'sb.i18nPlural', href: '/docs/i18n#pluralizacion' },
      { label: '', k: 'sb.i18nFormat', href: '/docs/i18n#formato' },
      { label: '', k: 'sb.i18nLangs', href: '/docs/i18n#idiomas' },
    ],
  },
  {
    title: 'Integraciones',
    titleK: 'sb.integrations',
    items: [
      { label: 'Tailwind CSS', href: '/docs/integrations#tailwind' },
      { label: 'Material UI (MUI)', href: '/docs/integrations#mui' },
      { label: '', k: 'sb.intCharts', href: '/docs/integrations#graficos' },
      { label: '', k: 'sb.intUtils', href: '/docs/integrations#utilidades' },
      { label: '', k: 'sb.intAnim', href: '/docs/integrations#animaciones' },
      { label: '', k: 'sb.intTable', href: '/docs/integrations#tabla' },
    ],
  },
  {
    title: 'Avanzado',
    titleK: 'sb.advanced',
    items: [
      { label: '', k: 'sb.advCompiler', href: '/docs/advanced#compilador' },
      { label: '', k: 'sb.advInference', href: '/docs/advanced#inferencia' },
      { label: '', k: 'sb.advVite', href: '/docs/advanced#vite' },
      { label: '', k: 'sb.advDeploy', href: '/docs/advanced#despliegue' },
    ],
  },
  {
    title: 'Deployment',
    titleK: 'sb.deploy',
    items: [
      { label: '', k: 'sb.deployWhy', href: '/docs/deployment#why' },
      { label: '', k: 'sb.deployBuild', href: '/docs/deployment#build' },
      { label: '', k: 'sb.deployAdapters', href: '/docs/deployment#adapters' },
      { label: '', k: 'sb.deployNode', href: '/docs/deployment#node' },
      { label: '', k: 'sb.deployVercel', href: '/docs/deployment#vercel' },
      { label: '', k: 'sb.deployCloudflare', href: '/docs/deployment#cloudflare' },
      { label: '', k: 'sb.deployStatic', href: '/docs/deployment#static' },
      { label: '', k: 'sb.deployEnv', href: '/docs/deployment#env' },
    ],
  },
  {
    title: 'IA',
    titleK: 'sb.ai',
    items: [
      { label: '', k: 'sb.aiEndpoints', href: '/docs/ai#endpoints' },
      { label: '', k: 'sb.aiStreaming', href: '/docs/ai#streaming' },
      { label: '', k: 'sb.aiBuildTime', href: '/docs/ai#build-time' },
      { label: '', k: 'sb.aiCaching', href: '/docs/ai#caching' },
      { label: '', k: 'sb.aiTools', href: '/docs/ai#tools' },
      { label: '', k: 'sb.aiRag', href: '/docs/ai#rag' },
      { label: '', k: 'sb.aiCli', href: '/docs/ai#cli' },
      { label: '', k: 'sb.aiConfig', href: '/docs/ai#config' },
    ],
  },
];

/** Resuelve el texto visible de una sección (clave i18n o literal). */
const sectionTitle = (section: DocSection) =>
  section.titleK ? i18n.t(section.titleK) : section.title;

// ── Estado activo del sidebar ─────────────────────────────────────────────
// La URL actual (path + hash) vive en un store compartido: los bindings
// dynamic() de items y secciones se actualizan solos al navegar o al hacer
// clic en un item. Se registra una sola vez (los módulos ES se ejecutan una
// vez por sesión, aunque el sidebar se re-monte en cada página de docs).
const navHref = store({
  href:
    typeof window !== 'undefined'
      ? window.location.pathname + (window.location.hash || '')
      : '',
});

if (typeof window !== 'undefined') {
  const syncNavHref = () => {
    navHref.href = window.location.pathname + (window.location.hash || '');
  };
  // Navegación por router (desde cualquier parte), back/forward y hash manual.
  onRouteChange(syncNavHref);
  window.addEventListener('popstate', syncNavHref);
  window.addEventListener('hashchange', syncNavHref);
}

// ── Drawer móvil (≤960px) ──────────────────────────────────────────────
// En escritorio el sidebar queda fijo a la izquierda; en móvil se esconde
// fuera de pantalla y se abre como drawer: botón flotante, backdrop, botón
// de cierre y tecla Escape. Al navegar se cierra solo.
const sbOpen = store({ open: false });

/** Abre/cierra el drawer y bloquea el scroll del fondo en móvil. */
const setSbOpen = (open: boolean) => {
  sbOpen.open = open;
  if (typeof document !== 'undefined') {
    document.body.classList.toggle('sb-open', open);
  }
};

if (typeof window !== 'undefined') {
  const w = window as unknown as {
    __sbKey?: (e: KeyboardEvent) => void;
    __sbMq?: MediaQueryList;
    __sbMqFn?: (e: MediaQueryListEvent) => void;
  };
  // Cierra el drawer al navegar (el sidebar se re-monta en cada página).
  onRouteChange(() => setSbOpen(false));
  // Dedupe para que HMR no acumule listeners duplicados.
  if (w.__sbKey) window.removeEventListener('keydown', w.__sbKey);
  w.__sbKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSbOpen(false); };
  window.addEventListener('keydown', w.__sbKey);
  if (w.__sbMq && w.__sbMqFn) w.__sbMq.removeEventListener('change', w.__sbMqFn);
  const mq = window.matchMedia('(min-width: 961px)');
  const onMq = (e: MediaQueryListEvent) => { if (e.matches) setSbOpen(false); };
  w.__sbMq = mq;
  w.__sbMqFn = onMq;
  mq.addEventListener('change', onMq);
}

if (typeof window !== 'undefined') {
  // ── Scroll-spy ──────────────────────────────────────────────────────────
  // Al hacer scroll en el contenido, el item activo sigue la sección que está
  // en pantalla (no solo al hacer clic). Solo actúa en páginas de docs.
  let spyQueued = false;
  const runScrollSpy = () => {
    spyQueued = false;
    if (!document.querySelector('.docs-sidebar')) return;
    const path = window.location.pathname;
    // Secciones de ESTA página, en el orden real del DOM (el orden del
    // sidebar puede diferir del orden del contenido).
    const els = docSections
      .flatMap((s) => s.items)
      .filter((it) => it.href.includes('#') && it.href.split('#')[0] === path)
      .map((it) => document.getElementById(it.href.split('#')[1]))
      .filter((el): el is HTMLElement => el !== null)
      .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
    if (!els.length) return;
    const line = 100; // línea de detección, debajo del header sticky
    let current = '';
    for (const el of els) {
      if (el.getBoundingClientRect().top <= line) current = el.id;
    }
    // Al llegar al final de la página, la última sección queda activa.
    const atBottom =
      window.scrollY + window.innerHeight >=
      document.documentElement.scrollHeight - 4;
    if (atBottom) current = els[els.length - 1].id;
    const target = current ? path + '#' + current : path;
    if (navHref.href === target) return;
    navHref.href = target;
    // Mantén el hash de la URL sincronizado sin ensuciar el historial.
    if ((window.location.hash || '') !== (current ? '#' + current : '')) {
      window.history.replaceState(null, '', target);
    }
  };
  const onScrollSpy = () => {
    if (spyQueued) return;
    spyQueued = true;
    requestAnimationFrame(runScrollSpy);
  };
  window.addEventListener('scroll', onScrollSpy, { passive: true });
}

/** Un item está activo si su href coincide con la URL, o si es el primer
 *  item de su sección y la URL apunta a esa página sin hash. */
const isItemActive = (currentHref: string, itemHref: string, idx: number) =>
  currentHref === itemHref ||
  (!currentHref.includes('#') && idx === 0 && currentHref === itemHref.split('#')[0]);

/** Una sección está activa si su página coincide con la URL actual. */
const isSectionActive = (currentHref: string, section: DocSection) =>
  section.items.some((it) => it.href.split('#')[0] === currentHref.split('#')[0]);

export const DocSidebar = component(() => {
  const style = `
    .docs-sidebar{position:fixed;top:64px;left:0;bottom:0;width:260px;background:#060b14;border-right:1px solid rgba(255,255,255,.06);overflow-y:auto;padding:24px 0 40px;z-index:50;overscroll-behavior:contain}
    .docs-sidebar-section{margin-bottom:8px}
    .docs-sidebar-title{padding:8px 28px;font-size:.68rem;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.08em}
    .docs-sidebar-title.active{color:#b84cff;font-weight:800}
    .docs-sidebar-item{display:block;padding:7px 28px;font-size:.8rem;color:#94a3b8;font-weight:500;transition:color .12s,background .12s;border-left:2px solid transparent}
    .docs-sidebar-item:hover{color:#e2e8f0;background:rgba(255,255,255,.02)}
    .docs-sidebar-item.active{color:#b84cff;background:rgba(184,76,255,.06);border-left-color:#b84cff;font-weight:700}
    .docs-sidebar-card{display:flex;align-items:center;gap:9px;margin:8px 20px;padding:9px 12px;border:1px solid rgba(255,255,255,.07);border-radius:10px;background:rgba(255,255,255,.02);text-decoration:none;transition:border-color .15s,background .15s,transform .15s}
    .docs-sidebar-card:hover{border-color:rgba(139,77,255,.45);background:rgba(139,77,255,.06);transform:translateY(-1px)}
    .docs-sidebar-card-icon{display:flex;align-items:center;line-height:1}
    .docs-sidebar-card-title{font-size:.78rem;font-weight:600;color:#e2e8f0}
    .docs-sidebar-card-arrow{margin-left:auto;display:flex;align-items:center;color:#94a3b8;transition:color .15s}
    .docs-sidebar-card:hover .docs-sidebar-card-arrow{color:#b84cff}
    .docs-sidebar-footer{padding:20px 28px;border-top:1px solid rgba(255,255,255,.06);margin-top:16px}
    .docs-sidebar-footer a{display:flex;align-items:center;gap:8px;font-size:.78rem;color:#94a3b8;font-weight:500;transition:color .15s}
    .docs-sidebar-footer a:hover{color:#e2e8f0}
    [id]{scroll-margin-top:84px}
    /* === DRAWER MÓVIL (≤960px) === */
    .docs-sb-root{display:contents}
    .docs-sb-toggle{display:none;position:fixed;bottom:20px;left:14px;z-index:40;width:44px;height:44px;align-items:center;justify-content:center;background:rgba(6,11,20,.92);border:1px solid rgba(255,255,255,.12);border-radius:12px;color:#e2e8f0;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.4)}
    .docs-sb-close{display:none;position:absolute;top:12px;right:12px;z-index:2;width:32px;height:32px;align-items:center;justify-content:center;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:8px;color:#94a3b8;cursor:pointer}
    .docs-sb-backdrop{display:none}
    body.sb-open{overflow:hidden}
    @media(max-width:960px){
      .docs-sidebar{transform:translateX(-105%);visibility:hidden;pointer-events:none;transition:transform .25s ease,visibility 0s linear .25s}
      .docs-sidebar.open{transform:translateX(0);visibility:visible;pointer-events:auto;transition:transform .25s ease;box-shadow:0 0 80px rgba(0,0,0,.55)}
      .docs-sb-toggle{display:flex}
      .docs-sb-close{display:flex}
      .docs-sb-backdrop{display:block;position:fixed;inset:0;z-index:45;background:rgba(2,4,9,.55);backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);opacity:0;pointer-events:none;transition:opacity .25s ease}
      .docs-sb-backdrop.open{opacity:1;pointer-events:auto}
    }
  `;

  // Wheel over the sidebar must scroll the SIDEBAR, never the page.
  // Native wheel hit-testing over a fixed scroll container is unreliable
  // across browsers (some chain the event to the document even mid-scroll,
  // leaving the sidebar stuck while the content moves), so we take the
  // wheel over completely and drive the scroll ourselves:
  //   - preventDefault → the page can never move from a wheel here;
  //   - aside.scrollTop += delta → the sidebar always follows the wheel
  //     (each wheel event, including trackpad inertia events, moves it).
  if (typeof document !== 'undefined') {
    const w = window as unknown as { __sbWheel?: (e: WheelEvent) => void };
    const handler = (e: WheelEvent) => {
      const aside = document.querySelector('.docs-sidebar') as HTMLElement | null;
      if (!aside) return;
      if (!aside.contains(e.target as Node)) return;
      // Trackpad pinch-zoom arrives as ctrl+wheel: let it behave natively.
      if (e.ctrlKey || e.deltaY === 0) return;
      e.preventDefault();
      const step =
        e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? aside.clientHeight : 1;
      aside.scrollTop += e.deltaY * step;
    };
    // Replace any previously installed handler (HMR re-runs this module
    // without reloading the page — the old listener must not linger).
    if (w.__sbWheel) document.removeEventListener('wheel', w.__sbWheel);
    w.__sbWheel = handler;
    document.addEventListener('wheel', handler, { passive: false });
  }

  return (
    <div class="docs-sb-root">
      <style>{style}</style>
      <button class="docs-sb-toggle" onclick={() => setSbOpen(true)} aria-label="Docs index">
        <Icon name="arrow-right" size={18} />
      </button>
      <div
        class={dynamic(() => `docs-sb-backdrop${sbOpen.open ? ' open' : ''}`)}
        onclick={() => setSbOpen(false)}
        aria-hidden="true"
      />
      <aside class={dynamic(() => `docs-sidebar${sbOpen.open ? ' open' : ''}`)}>
        <button class="docs-sb-close" onclick={() => setSbOpen(false)} aria-label="Close">
          <Icon name="x" size={16} />
        </button>
        <nav>
        {docSections.map(section => (
          <div class="docs-sidebar-section">
            <div class={dynamic(() => `docs-sidebar-title${isSectionActive(navHref.href, section) ? ' active' : ''}`)}>
              {sectionTitle(section)}
            </div>
            {section.items.map((item, idx) => (
              <a
                href={item.href}
                class={dynamic(() => `docs-sidebar-item${isItemActive(navHref.href, item.href, idx) ? ' active' : ''}`)}
                onclick={(e: Event) => {
                  e.preventDefault();
                  // En móvil, elegir un item desde el drawer debe cerrarlo.
                  setSbOpen(false);
                  const parts = item.href.split('#');
                  navigate(parts[0]);
                  if (parts[1]) {
                    const hash = parts[1];
                    // navigate() solo empuja el path: sincroniza el hash en la
                    // URL para que el estado activo refleje la sección.
                    const full = window.location.pathname + '#' + hash;
                    if (window.location.pathname + window.location.hash !== full) {
                      window.history.replaceState(null, '', full);
                      // replaceState no dispara hashchange: avísalo manualmente
                      // para que las páginas que reaccionan al hash se enteren.
                      window.dispatchEvent(new Event('hashchange'));
                    }
                    navHref.href = full;
                    const scrollToHash = () => {
                          const el = document.getElementById(hash);
                          if (!el) return;
                          const html = document.documentElement;
                          const prev = html.style.scrollBehavior;
                          html.style.scrollBehavior = 'auto';
                          el.scrollIntoView({ block: 'start' });
                          html.style.scrollBehavior = prev;
                        };
                        // After the router re-render (it also resets scroll).
                        // The second pass covers slower renders. If the user
                        // starts scrolling before a pending pass fires, cancel
                        // it — the page must never yank away while the user
                        // is interacting with the sidebar.
                        const timers = [
                          window.setTimeout(scrollToHash, 80),
                          window.setTimeout(scrollToHash, 350),
                        ];
                        const cancelPendingScroll = () => {
                          timers.forEach((t) => window.clearTimeout(t));
                          window.removeEventListener('wheel', cancelPendingScroll);
                        };
                        window.addEventListener('wheel', cancelPendingScroll, { passive: true });
                      } else {
                        navHref.href = window.location.pathname;
                      }
                    }}
                  >
                    {item.k ? i18n.t(item.k) : item.label}
                  </a>
                ))}
                {section.cards?.map((c) => (
                  <a class="docs-sidebar-card" href={c.href} target="_blank" rel="noopener">
                    <span class="docs-sidebar-card-icon"><Icon name={c.icon} size={15} /></span>
                    <span class="docs-sidebar-card-title">{c.title}</span>
                    <span class="docs-sidebar-card-arrow"><Icon name="arrow-right" size={11} /></span>
                  </a>
                ))}
            </div>
          ))}
      </nav>
      <div class="docs-sidebar-footer">
        <a href="https://github.com" target="_blank" rel="noopener">
          <Icon name="star" size={13} /> 0.0 GitHub
        </a>
      </div>
      </aside>
    </div>
  );
});
