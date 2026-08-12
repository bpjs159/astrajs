import { component, store, dynamic } from '@astrajs/core';
import { Link, params } from '@astrajs/router';

interface DocSection {
  title: string;
  items: { label: string; href: string }[];
}

const docSections: DocSection[] = [
  {
    title: 'Introducción',
    items: [
      { label: '¿Qué es AstraJS?', href: '/docs/introduction' },
      { label: 'Instalación', href: '/docs/introduction#instalacion' },
      { label: 'Primeros pasos', href: '/docs/introduction#primeros-pasos' },
      { label: 'Conceptos clave', href: '/docs/introduction#conceptos-clave' },
    ],
  },
  {
    title: 'Fundamentos',
    items: [
      { label: 'Componentes', href: '/docs/fundamentals#componentes' },
      { label: 'Reactividad con store', href: '/docs/fundamentals#reactividad' },
      { label: 'JSX sin VDOM', href: '/docs/fundamentals#jsx-sin-vdom' },
      { label: 'Estilos con css', href: '/docs/fundamentals#estilos' },
      { label: 'Eventos resumibles', href: '/docs/fundamentals#eventos' },
    ],
  },
  {
    title: 'Server & Data',
    items: [
      { label: 'server', href: '/docs/server-data#server' },
      { label: 'Tipos pre-build vs dynamic', href: '/docs/server-data#tipos-server' },
      { label: 'Revalidate & Caching', href: '/docs/server-data#caching' },
      { label: 'autoSync y ETAGS', href: '/docs/server-data#autosync' },
    ],
  },
  {
    title: 'Router',
    items: [
      { label: 'Rutas y <Outlet />', href: '/docs/router#rutas' },
      { label: 'Layouts anidados', href: '/docs/router#layouts' },
      { label: 'Navegación', href: '/docs/router#navegacion' },
      { label: 'View Transitions API', href: '/docs/router#view-transitions' },
    ],
  },
  {
    title: 'Renderizado',
    items: [
      { label: 'SSR', href: '/docs/rendering#ssr' },
      { label: 'SSG', href: '/docs/rendering#ssg' },
      { label: 'ISR', href: '/docs/rendering#isr' },
      { label: 'Resumibilidad', href: '/docs/rendering#resumibilidad' },
    ],
  },
  {
    title: 'Ejemplos',
    items: [
      { label: 'Frontend-only (10)', href: '/docs/examples#frontend' },
      { label: 'Fullstack (10)', href: '/docs/examples#fullstack' },
    ],
  },
  {
    title: 'Comparativa',
    items: [
      { label: 'React vs AstraJS', href: '/docs/comparison#react-vs' },
      { label: 'Vue.js vs AstraJS', href: '/docs/comparison#vue-vs' },
      { label: 'Angular vs AstraJS', href: '/docs/comparison#angular-vs' },
    ],
  },
  {
    title: 'CLI',
    items: [
      { label: 'What is the CLI?', href: '/docs/cli#que-es' },
      { label: 'Creating a project', href: '/docs/cli#crear-proyecto' },
      { label: 'Templates', href: '/docs/cli#plantillas' },
      { label: 'Options', href: '/docs/cli#opciones' },
    ],
  },
  {
    title: 'Pruebas',
    items: [
      { label: 'Unitarias con Vitest', href: '/docs/testing#unitarias' },
      { label: 'Con Jest', href: '/docs/testing#jest' },
      { label: 'E2E con Playwright', href: '/docs/testing#e2e-playwright' },
      { label: 'E2E con Cypress', href: '/docs/testing#e2e-cypress' },
      { label: 'server() RPC', href: '/docs/testing#server' },
      { label: 'Comparativa', href: '/docs/testing#comparativa' },
    ],
  },
  {
    title: 'Avanzado',
    items: [
      { label: 'Compilador AST', href: '/docs/advanced#compilador' },
      { label: 'Inferencia de tipos', href: '/docs/advanced#inferencia' },
      { label: 'Integración con Vite', href: '/docs/advanced#vite' },
      { label: 'Despliegue', href: '/docs/advanced#despliegue' },
    ],
  },
];

export const DocSidebar = component(() => {
  const state = store({ activeSection: '' });

  const style = `
    .docs-sidebar{position:fixed;top:64px;left:0;bottom:0;width:260px;background:#060b14;border-right:1px solid rgba(255,255,255,.06);overflow-y:auto;padding:24px 0 40px;z-index:50}
    .docs-sidebar-section{margin-bottom:8px}
    .docs-sidebar-title{padding:8px 28px;font-size:.68rem;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.08em}
    .docs-sidebar-item{display:block;padding:7px 28px;font-size:.8rem;color:#94a3b8;font-weight:500;transition:color .12s,background .12s;border-left:2px solid transparent}
    .docs-sidebar-item:hover{color:#e2e8f0;background:rgba(255,255,255,.02)}
    .docs-sidebar-item.active{color:#b84cff;background:rgba(184,76,255,.06);border-left-color:#b84cff}
    .docs-sidebar-footer{padding:20px 28px;border-top:1px solid rgba(255,255,255,.06);margin-top:16px}
    .docs-sidebar-footer a{display:flex;align-items:center;gap:8px;font-size:.78rem;color:#64748b;font-weight:500;transition:color .15s}
    .docs-sidebar-footer a:hover{color:#e2e8f0}
    @media(max-width:960px){
      .docs-sidebar{display:none}
    }
  `;

  return (
    <aside class="docs-sidebar">
      <style>{style}</style>
      <nav>
        {docSections.map(section => (
          <div class="docs-sidebar-section">
            <div class="docs-sidebar-title">{section.title}</div>
            {section.items.map(item => (
              <Link href={item.href} class="docs-sidebar-item">
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div class="docs-sidebar-footer">
        <a href="https://github.com" target="_blank" rel="noopener">
          <span>⭐</span> 26.1k GitHub
        </a>
      </div>
    </aside>
  );
});
