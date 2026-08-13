import { component, store } from '@astrajs/core';
import { navigate } from '@astrajs/router';
import { i18n } from '../i18n.js';
import { Icon } from './icon.js';

interface DocSection {
  /** Título literal (término técnico) o clave i18n cuando existe titleK. */
  title: string;
  titleK?: string;
  items: { label: string; k?: string; href: string }[];
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
      { label: 'Frontend-only (10)', href: '/docs/examples#frontend' },
      { label: 'Fullstack (10)', href: '/docs/examples#fullstack' },
    ],
  },
  {
    title: 'Comparativa',
    titleK: 'sb.compare',
    items: [
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
];

/** Resuelve el texto visible de una sección (clave i18n o literal). */
const sectionTitle = (section: DocSection) =>
  section.titleK ? i18n.t(section.titleK) : section.title;

export const DocSidebar = component(() => {
  const state = store({ activeSection: '' });

  const style = `
    .docs-sidebar{position:fixed;top:64px;left:0;bottom:0;width:260px;background:#060b14;border-right:1px solid rgba(255,255,255,.06);overflow-y:auto;padding:24px 0 40px;z-index:50;overscroll-behavior:contain}
    .docs-sidebar-section{margin-bottom:8px}
    .docs-sidebar-title{padding:8px 28px;font-size:.68rem;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.08em}
    .docs-sidebar-title.active{color:#b84cff;font-weight:800}
    .docs-sidebar-item{display:block;padding:7px 28px;font-size:.8rem;color:#94a3b8;font-weight:500;transition:color .12s,background .12s;border-left:2px solid transparent}
    .docs-sidebar-item:hover{color:#e2e8f0;background:rgba(255,255,255,.02)}
    .docs-sidebar-item.active{color:#b84cff;background:rgba(184,76,255,.06);border-left-color:#b84cff;font-weight:700}
    .docs-sidebar-footer{padding:20px 28px;border-top:1px solid rgba(255,255,255,.06);margin-top:16px}
    .docs-sidebar-footer a{display:flex;align-items:center;gap:8px;font-size:.78rem;color:#64748b;font-weight:500;transition:color .15s}
    .docs-sidebar-footer a:hover{color:#e2e8f0}
    [id]{scroll-margin-top:84px}
    @media(max-width:960px){
      .docs-sidebar{display:none}
    }
  `;

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const currentHref = typeof window !== 'undefined' ? window.location.pathname + window.location.hash : '';

  // Wheel over the sidebar must never scroll the page content.
  // - If the sidebar has overflow, native scroll handles it and
  //   overscroll-behavior:contain stops the chaining to the page.
  // - If it has no overflow (short pages), swallow the event.
  if (typeof document !== 'undefined') {
    const w = window as unknown as { __sbWheel?: boolean };
    if (!w.__sbWheel) {
      w.__sbWheel = true;
      document.addEventListener('wheel', (e: WheelEvent) => {
        const aside = document.querySelector('.docs-sidebar');
        if (!aside) return;
        if (!aside.contains(e.target as Node)) return;
        if (aside.scrollHeight <= aside.clientHeight) {
          e.preventDefault();
        }
      }, { passive: false });
    }
  }

  return (
    <aside class="docs-sidebar">
      <style>{style}</style>
      <nav>
        {docSections.map(section => {
          const sectionActive = section.items.some((it) => it.href.split('#')[0] === currentPath);
          return (
            <div class="docs-sidebar-section">
              <div class={`docs-sidebar-title${sectionActive ? ' active' : ''}`}>{sectionTitle(section)}</div>
              {section.items.map((item, idx) => {
                const isActive =
                  currentHref === item.href ||
                  (!currentHref.includes('#') && idx === 0 && currentHref === item.href.split('#')[0]);
                return (
                  <a
                    href={item.href}
                    class={`docs-sidebar-item${isActive ? ' active' : ''}`}
                    onclick={(e: Event) => {
                      e.preventDefault();
                      const parts = item.href.split('#');
                      navigate(parts[0]);
                      if (parts[1]) {
                        const hash = parts[1];
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
                        setTimeout(scrollToHash, 80);
                        setTimeout(scrollToHash, 350);
                      }
                    }}
                  >
                    {item.k ? i18n.t(item.k) : item.label}
                  </a>
                );
              })}
            </div>
          );
        })}
      </nav>
      <div class="docs-sidebar-footer">
        <a href="https://github.com" target="_blank" rel="noopener">
          <Icon name="star" size={13} /> 0.0 GitHub
        </a>
      </div>
    </aside>
  );
});
