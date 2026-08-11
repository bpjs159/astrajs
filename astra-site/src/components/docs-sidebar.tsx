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
      { label: '¿Qué es AstraJS?', href: '/docs' },
      { label: 'Instalación', href: '/docs#instalacion' },
      { label: 'Primeros pasos', href: '/docs#primeros-pasos' },
      { label: 'Conceptos clave', href: '/docs#conceptos-clave' },
    ],
  },
  {
    title: 'Fundamentos',
    items: [
      { label: 'Componentes', href: '/docs#componentes' },
      { label: 'Reactividad con store', href: '/docs#reactividad' },
      { label: 'JSX sin VDOM', href: '/docs#jsx-sin-vdom' },
      { label: 'Estilos con css', href: '/docs#estilos' },
      { label: 'Eventos resumibles', href: '/docs#eventos' },
    ],
  },
  {
    title: 'Server & Data',
    items: [
      { label: 'server', href: '/docs#server' },
      { label: 'Tipos pre-build vs dynamic', href: '/docs#tipos-server' },
      { label: 'Revalidate & Caching', href: '/docs#caching' },
      { label: 'autoSync y ETAGS', href: '/docs#autosync' },
    ],
  },
  {
    title: 'Router',
    items: [
      { label: 'Rutas y <Outlet />', href: '/docs#rutas' },
      { label: 'Layouts anidados', href: '/docs#layouts' },
      { label: 'Navegación', href: '/docs#navegacion' },
      { label: 'View Transitions API', href: '/docs#view-transitions' },
    ],
  },
  {
    title: 'Renderizado',
    items: [
      { label: 'SSR', href: '/docs#ssr' },
      { label: 'SSG', href: '/docs#ssg' },
      { label: 'ISR', href: '/docs#isr' },
      { label: 'Resumibilidad', href: '/docs#resumibilidad' },
    ],
  },
  {
    title: 'Avanzado',
    items: [
      { label: 'Compilador AST', href: '/docs#compilador' },
      { label: 'Inferencia de tipos', href: '/docs#inferencia' },
      { label: 'Integración con Vite', href: '/docs#vite' },
      { label: 'Despliegue', href: '/docs#despliegue' },
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
