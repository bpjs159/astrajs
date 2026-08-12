import { component, dynamic } from '@astrajs/core';
import { DocSidebar } from '../../components/docs-sidebar.js';
import { i18n } from '../../i18n.js';

const s = `
  .docs-layout{display:flex;min-height:100vh}
  .docs-main{flex:1;margin-left:260px;padding:48px 56px;max-width:860px}
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
        <pre><code>{`// Funcion pura — sin estado, sin wrapping
function Greeting({ name }: { name: string }) {
  return <h2>Hola, {name}!</h2>;
}

// Uso directo:
document.body.appendChild(<Greeting name="Ada" /> as any);`}</code></pre>

        <h3>{i18n.t('f.sf.title')}</h3>
        <p>{i18n.t('f.sf.a')}<code>component()</code>{i18n.t('f.sf.mid')}<strong>{i18n.t('f.sf.b')}</strong>{i18n.t('f.sf.c')}</p>
        <pre><code>{`import { component, store } from '@astrajs/core';

export const Counter = component(() => {
  // store() crea un Proxy reactivo
  const state = store({ count: 0 });

  // Esta funcion se ejecuta UNA SOLA VEZ
  return (
    <div>
      <h2>Contador: {state.count}</h2>
      <button onclick={() => state.count++}>
        Incrementar
      </button>
    </div>
  );
  // El compilador transforma {state.count}
  // en: effect(() => { textNode.nodeValue = state.count; })
  // Solo ese TextNode se actualiza cuando count cambia.
});`}</code></pre>
        <div class="note">
          <strong>{i18n.t('lbl.important')}:</strong> <code>component()</code> {i18n.t('f.note.a')}<code>&lt;span style="display:contents"&gt;</code>{i18n.t('f.note.b')}<code>mounted()</code>{i18n.t('f.note.c')}
        </div>

        <h2 id="reactividad">{i18n.t('sb.reactivity')}</h2>
        <p><code>store()</code> {i18n.t('f.react.a')}<strong>{i18n.t('f.react.b')}</strong>{i18n.t('f.react.c')}</p>

        <h3>{i18n.t('f.proxy.title')}</h3>
        <pre><code>{`import { store } from '@astrajs/core';

const user = store({
  name: 'Ada',
  age: 28,
  profile: {
    bio: 'Desarrolladora',
    avatar: '/ada.jpg'
  }
});

// LECTURA → el Proxy registra que estas leyendo "name"
// Si esto ocurre dentro de un effect(), se crea una suscripcion
console.log(user.name); // 'Ada'

// ESCRITURA → el Proxy notifica SOLO a los suscriptores de "name"
user.name = 'Grace';
// Internamente:
//   1. Se actualiza el valor
//   2. Se notifica a cada effect suscrito a "name"
//   3. Los effects ejecutan sus callbacks
//   4. Solo los TextNodes de "name" se actualizan en el DOM

// Objetos anidados tambien son reactivos (lazy proxy)
user.profile.bio = 'Senior Developer';
// → solo se actualizan los suscriptores de "profile.bio"`}</code></pre>

        <h3>{i18n.t('f.arrays.title')}</h3>
        <p>{i18n.t('f.arr.a')}<code>push</code>{i18n.t('f.arr.b')}<code>splice</code>{i18n.t('f.arr.c')}</p>
        <pre><code>{`const app = store({
  items: ['A', 'B', 'C'],
  selected: null as string | null
});

// Mutaciones de array → reactivas
app.items.push('D');       // notifica a suscriptores de "items" y "items.length"
app.items[0] = 'Z';       // notifica a suscriptores de "items[0]"
app.items = [...app.items]; // reemplazo completo → notifica a suscriptores de "items"`}</code></pre>

        <h3>{i18n.t('f.batch.title')}</h3>
        <p>{i18n.t('f.bat.a')}<code>queueMicrotask()</code>{i18n.t('f.bat.b')}<code>batch()</code>{i18n.t('f.bat.c')}</p>
        <pre><code>{`// Estas 3 mutaciones → 1 solo ciclo de DOM update
user.name = 'Grace';
user.age = 29;
user.profile.bio = 'Senior';

// Los efectos se ejecutan una vez, no tres.
// Los nodos del DOM se actualizan en un solo microtask.`}</code></pre>

        <h2 id="jsx-sin-vdom">{i18n.t('sb.jsx')}</h2>
        <p>{i18n.t('f.jsx.a')}<code>createElement</code>{i18n.t('f.jsx.b')}</p>

        <h3>{i18n.t('f.trans.title')}</h3>
        <pre><code>{`// === TU CODIGO (JSX) ===
function Saludo({ nombre }: { nombre: string }) {
  return (
    <div class="saludo">
      <span>Hola, </span>
      <strong>{nombre}</strong>
    </div>
  );
}

// === LO QUE GENERA EL COMPILADOR (aproximado) ===
function Saludo({ nombre }: { nombre: string }) {
  const div = document.createElement('div');
  div.className = 'saludo';
  
  const span = document.createElement('span');
  span.textContent = 'Hola, ';
  div.appendChild(span);
  
  const strong = document.createElement('strong');
  const text = document.createTextNode('');
  strong.appendChild(text);
  div.appendChild(strong);
  
  // Binding reactivo de grano fino
  effect(() => {
    text.nodeValue = String(nombre);
  });
  
  return div;
}`}</code></pre>

        <h3>{i18n.t('f.cond.title')}</h3>
        <p>{i18n.t('f.cond.a')}<code>bindConditional</code>{i18n.t('f.cond.b')}</p>
        <pre><code>{`// Escribes:
<div>{show && <span>Visible!</span>}</div>

// El compilador genera:
const marker = document.createComment('~');
bindConditional(marker, () => show, 
  () => <span>Visible!</span>
);
// Cuando show cambia, el <span> se inserta/remueve del DOM
// sin re-crear el <div> padre.`}</code></pre>

        <h3>{i18n.t('f.list.title')}</h3>
        <p>{i18n.t('f.list.a')}<code>array.map()</code>{i18n.t('f.list.b')}<code>bindList</code>{i18n.t('f.list.c')}</p>
        <pre><code>{`// Escribes:
<ul>
  {items.map(item => <li key={item.id}>{item.name}</li>)}
</ul>

// El compilador genera bindList con key-based diffing:
// - Items nuevos → se crean
// - Items removidos → se eliminan
// - Items reordenados → se mueven (sin re-crear)
// - Items con misma key → se preservan`}</code></pre>

        <h2 id="estilos">{i18n.t('sb.css')}</h2>
        <p>{i18n.t('f.css.a')}<code>css</code>{i18n.t('f.css.b')}</p>
        <pre><code>{`import { css } from '@astrajs/core';

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
}`}</code></pre>
        <p>{i18n.t('f.cls.a')}<code>classes()</code>{i18n.t('f.cls.b')}</p>
        <pre><code>{`import { classes } from '@astrajs/core';

<div class={classes(cardStyle, featured && 'featured', 'mb-4')}>
  ...
</div>`}</code></pre>

        <h2 id="eventos">{i18n.t('sb.events')}</h2>
        <p>{i18n.t('f.ev.a')}<strong>{i18n.t('f.ev.b')}</strong>{i18n.t('f.ev.c')}</p>
        <pre><code>{`// Eventos nativos — se ejecutan inmediatamente
<button onclick={() => state.count++}>
  Incrementar
</button>

// Eventos resumibles — el JS se carga JIT
<button astra-on:click={heavyHandler}>
  Accion compleja (codigo cargado on-demand)
</button>`}</code></pre>
        <div class="note">
          <strong>{i18n.t('lbl.keydiff')}:</strong> <code>onclick</code> {i18n.t('f.ev.n1')}<code>astra-on:click</code>{i18n.t('f.ev.n2')}
        </div>
      </div>
    </main>
  </div>
));
