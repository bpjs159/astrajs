import { component, dynamic } from '@bpjs159/core';
import { DocSidebar } from '../../components/docs-sidebar.js';
import { DocRightToc } from '../../components/doc-right-toc.js';
import { i18n } from '../../i18n.js';
import { CodeBlock } from '../../components/code-block.js';

const s = `
  .docs-layout{display:flex;min-height:100vh}
  .docs-main{flex:1;min-width:0;margin-left:260px;padding:48px 56px;max-width:860px}
  @media(max-width:960px){.docs-main{margin-left:0;padding:32px 24px}}
  .docs-content h1{font-size:2rem;font-weight:800;color:#f7f7ff;margin-bottom:12px;letter-spacing:-.02em}
  .docs-content h2{font-size:1.3rem;font-weight:700;color:#f7f7ff;margin:40px 0 14px;padding-top:20px;border-top:1px solid rgba(255,255,255,.06);letter-spacing:-.01em}
  .docs-content h2:first-of-type{border-top:none;margin-top:28px}
  .docs-content h3{font-size:1.05rem;font-weight:700;color:#f7f7ff;margin:28px 0 10px}
  .docs-content p{font-size:.88rem;color:#94a3b8;line-height:1.75;margin-bottom:16px}
  .docs-content strong{color:#e2e8f0}
  .docs-content code{background:rgba(139,77,255,.1);color:#c4a0ff;padding:2px 7px;border-radius:4px;font-size:.8rem;font-weight:500;font-family:'JetBrains Mono',monospace}
  .docs-content pre{background:#060b14;border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:0;overflow-x:auto;margin-bottom:24px;position:relative}
  .docs-content pre::before{content:'TS';position:absolute;top:0;right:16px;font-size:.62rem;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.08em;padding:8px 0}
  .docs-content pre code{display:block;background:none;color:#cbd5e1;padding:20px 24px;font-size:.76rem;line-height:1.85;border-radius:0;overflow-x:auto;white-space:pre;tab-size:2}
  .docs-content ul,.docs-content ol{padding-left:24px;margin-bottom:16px}
  .docs-content li{font-size:.88rem;color:#94a3b8;line-height:1.75;margin-bottom:6px}
  .docs-content .note{padding:14px 18px;background:rgba(139,77,255,.06);border-left:3px solid rgba(139,77,255,.3);border-radius:0 8px 8px 0;margin-bottom:20px;font-size:.84rem;color:#c4a0ff}
`;

export const DocsFundamentals = component(() => (
  <div class="docs-layout">
    <style>{s}</style>
    <DocSidebar />
    <main class="docs-main">
      <div class="docs-content">
        <h1>{i18n.t('sb.fund')}</h1>
        <p>{i18n.t('f.hero')}</p>

        <h2 id="componentes">{i18n.t('sb.components')}</h2>
        <p>{i18n.t('f.c1a')}<strong>{i18n.t('f.c1b')}</strong>{i18n.t('f.c1c')}<code>document.querySelector</code>{i18n.t('f.c1d')}<code>addEventListener</code>{i18n.t('f.c1e')}</p>

        <h3>{i18n.t('f.st.title')}</h3>
        <p>{i18n.t('f.st.p1')}<code>component()</code>{i18n.t('f.st.p2')}</p>
        <CodeBlock code={`// Pure function — no state, no wrapping
function Greeting({ name }: { name: string }) {
  return <h2>Hello, {name}!</h2>;
}

// Direct usage:
document.body.appendChild(<Greeting name="Ada" /> as any);`} commentsKey="fund.pure" />

        <h3>{i18n.t('f.sf.title')}</h3>
        <p>{i18n.t('f.sf.a')}<code>component()</code>{i18n.t('f.sf.mid')}<strong>{i18n.t('f.sf.b')}</strong>{i18n.t('f.sf.c')}</p>
        <CodeBlock code={`import { component, store } from '@bpjs159/core';

export const Counter = component(() => {
  // store() creates a reactive Proxy
  const state = store({ count: 0 });

  // This function runs ONCE
  return (
    <div>
      <h2>Counter: {state.count}</h2>
      <button onclick={() => state.count++}>
        Increment
      </button>
    </div>
  );
  // The compiler transforms {state.count}
  // into: effect(() => { textNode.nodeValue = state.count; })
  // Only that TextNode updates when count changes.
});`} commentsKey="fund.counter" />
        <div class="note">
          <strong>{i18n.t('lbl.important')}:</strong> <code>component()</code> {i18n.t('f.note.a')}<code>&lt;span style="display:contents"&gt;</code>{i18n.t('f.note.b')}<code>mounted()</code>{i18n.t('f.note.c')}
        </div>

        <h2 id="reactividad">{i18n.t('sb.reactivity')}</h2>
        <p><code>store()</code> {i18n.t('f.react.a')}<strong>{i18n.t('f.react.b')}</strong>{i18n.t('f.react.c')}</p>

        <h3>{i18n.t('f.proxy.title')}</h3>
        <CodeBlock code={`import { store } from '@bpjs159/core';

const user = store({
  name: 'Ada',
  age: 28,
  profile: {
    bio: 'Developer',
    avatar: '/ada.jpg'
  }
});

// READ → the Proxy registers that you are reading "name"
// If this happens inside an effect(), a subscription is created
console.log(user.name); // 'Ada'

// WRITE → the Proxy notifies ONLY the "name" subscribers
user.name = 'Grace';
// Internally:
//   1. The value is updated
//   2. Every effect subscribed to "name" is notified
//   3. The effects run their callbacks
//   4. Only the "name" TextNodes update in the DOM

// Nested objects are reactive too (lazy proxy)
user.profile.bio = 'Senior Developer';
// → only "profile.bio" subscribers update`} commentsKey="fund.proxy" />

        <h3>{i18n.t('f.arrays.title')}</h3>
        <p>{i18n.t('f.arr.a')}<code>push</code>{i18n.t('f.arr.b')}<code>splice</code>{i18n.t('f.arr.c')}</p>
        <CodeBlock code={`const app = store({
  items: ['A', 'B', 'C'],
  selected: null as string | null
});

// Array mutations → reactive
app.items.push('D');       // notifies "items" and "items.length" subscribers
app.items[0] = 'Z';       // notifies "items[0]" subscribers
app.items = [...app.items]; // full replacement → notifies "items" subscribers`} commentsKey="fund.arrays" />

        <h3>{i18n.t('f.batch.title')}</h3>
        <p>{i18n.t('f.bat.a')}<code>queueMicrotask()</code>{i18n.t('f.bat.b')}<code>batch()</code>{i18n.t('f.bat.c')}</p>
        <CodeBlock code={`// These 3 mutations → a single DOM update cycle
user.name = 'Grace';
user.age = 29;
user.profile.bio = 'Senior';

// Effects run once, not three times.
// The DOM nodes update in a single microtask.`} commentsKey="fund.batch" />

        <h2 id="jsx-sin-vdom">{i18n.t('sb.jsx')}</h2>
        <p>{i18n.t('f.jsx.a')}<code>createElement</code>{i18n.t('f.jsx.b')}</p>

        <h3>{i18n.t('f.trans.title')}</h3>
        <CodeBlock code={`// === YOUR CODE (JSX) ===
function Greeting({ name }: { name: string }) {
  return (
    <div class="greeting">
      <span>Hello, </span>
      <strong>{name}</strong>
    </div>
  );
}

// === WHAT THE COMPILER GENERATES (approximate) ===
function Greeting({ name }: { name: string }) {
  const div = document.createElement('div');
  div.className = 'greeting';
  
  const span = document.createElement('span');
  span.textContent = 'Hello, ';
  div.appendChild(span);
  
  const strong = document.createElement('strong');
  const text = document.createTextNode('');
  strong.appendChild(text);
  div.appendChild(strong);
  
  // Fine-grained reactive binding
  effect(() => {
    text.nodeValue = String(name);
  });
  
  return div;
}`} commentsKey="fund.jsx" />

        <h3>{i18n.t('f.cond.title')}</h3>
        <p>{i18n.t('f.cond.a')}<code>bindConditional</code>{i18n.t('f.cond.b')}</p>
        <CodeBlock code={`// You write:
<div>{show && <span>Visible!</span>}</div>

// The compiler generates:
const marker = document.createComment('~');
bindConditional(marker, () => show, 
  () => <span>Visible!</span>
);
// When show changes, the <span> is inserted/removed from the DOM
// without re-creating the parent <div>.`} commentsKey="fund.cond" />

        <h3>{i18n.t('f.list.title')}</h3>
        <p>{i18n.t('f.list.a')}<code>array.map()</code>{i18n.t('f.list.b')}<code>bindList</code>{i18n.t('f.list.c')}</p>
        <CodeBlock code={`// You write:
<ul>
  {items.map(item => <li key={item.id}>{item.name}</li>)}
</ul>

// The compiler generates bindList with key-based diffing:
// - New items → created
// - Removed items → deleted
// - Reordered items → moved (without re-creating)
// - Items with the same key → preserved`} commentsKey="fund.list" />

        <h2 id="estilos">{i18n.t('sb.css')}</h2>
        <p>{i18n.t('f.css.a')}<code>css</code>{i18n.t('f.css.b')}</p>
        <CodeBlock code={`import { css } from '@bpjs159/core';

const cardStyle = css\`
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 14px;
  padding: 24px;
  transition: border-color .2s, transform .2s;

  &:hover {
    border-color: #818cf8;
    transform: translateY(-2px);
  }

  & .title {
    font-size: 1.1rem;
    font-weight: 700;
    color: #f7f7ff;
  }

  &.featured {
    border-color: #b84cff;
    box-shadow: 0 0 20px rgba(184,76,255,.15);
  }
\`;

function Card({ title, featured }: { title: string; featured?: boolean }) {
  return (
    <div class={cardStyle + (featured ? ' featured' : '')}>
      <span class="title">{title}</span>
    </div>
  );
}`} />
        <p>{i18n.t('f.cls.a')}<code>classes()</code>{i18n.t('f.cls.b')}</p>
        <CodeBlock code={`import { classes } from '@bpjs159/core';

<div class={classes(cardStyle, featured && 'featured', 'mb-4')}>
  ...
</div>`} />

        <h2 id="eventos">{i18n.t('sb.events')}</h2>
        <p>{i18n.t('f.ev.a')}<strong>{i18n.t('f.ev.b')}</strong>{i18n.t('f.ev.c')}</p>
        <CodeBlock code={`// Eventos nativos — se ejecutan inmediatamente
<button onclick={() => state.count++}>
  Increment
</button>

// Eventos resumibles — el JS se carga JIT
<button astra-on:click={heavyHandler}>
  Complex action (code loaded on-demand)
</button>`} commentsKey="fund.events" />
        <div class="note">
          <strong>{i18n.t('lbl.keydiff')}:</strong> <code>onclick</code> {i18n.t('f.ev.n1')}<code>astra-on:click</code>{i18n.t('f.ev.n2')}
        </div>
      </div>
    </main>
    <DocRightToc items={[
      { href: '/docs/fundamentals#componentes', k: 'sb.components' },
      { href: '/docs/fundamentals#reactividad', k: 'sb.reactivity' },
      { href: '/docs/fundamentals#jsx-sin-vdom', k: 'sb.jsx' },
      { href: '/docs/fundamentals#estilos', k: 'sb.css' },
      { href: '/docs/fundamentals#eventos', k: 'sb.events' },
    ]} />
  </div>
));
