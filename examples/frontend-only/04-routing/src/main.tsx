import { component, store } from '@astrajs/core';
import { styles } from './styles.js';

const router = store({ path: typeof window !== 'undefined' ? window.location.pathname || '/' : '/' });
const routes: Record<string,{emoji:string;title:string;desc:string;badge:string}> = {
  '/': { emoji:'??', title:'Home', desc:'Welcome to the routing demo.', badge:'Dashboard' },
  '/products': { emoji:'??', title:'Products', desc:'Browse our catalog.', badge:'Catalog' },
  '/about': { emoji:'??', title:'About', desc:'SPA navigation with pushState.', badge:'Info' },
  '/settings': { emoji:'??', title:'Settings', desc:'State persists across navigation.', badge:'Config' },
};
function navigate(path: string) { window.history.pushState(null, '', path); router.path = path; }
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => { router.path = window.location.pathname; });
  window.history.replaceState(null, '', router.path);
}

export const RouterDemo = component(() => {
  const current = routes[router.path] ?? routes['/']!;
  return (
    <div class={styles.shell}>
      <nav>
        <h2>AstraRouter</h2>
        {Object.keys(routes).map(p => (
          <a href={p} class={router.path === p ? styles.active : ''} onClick={(e:Event) => { e.preventDefault(); navigate(p); }}>{routes[p]!.emoji} {routes[p]!.title}</a>
        ))}
      </nav>
      <main>
        <div class={styles.page}>
          <div class={styles.pageEmoji}>{current.emoji}</div>
          <h1>{current.title}</h1>
          <p>{current.desc}</p>
          <span class={styles.badge}>{current.badge}</span>
        </div>
      </main>
    </div>
  );
});
