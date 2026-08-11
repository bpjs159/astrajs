import { component, dynamic } from '@astrajs/core';
import { DocSidebar } from '../../components/docs-sidebar.js';

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
        <h1>Fundamentos</h1>
        <p>Los bloques esenciales para construir aplicaciones con AstraJS. Cada concepto esta disenado para ser minimalista, predecible y de maximo rendimiento.</p>

        <h2>Componentes</h2>
        <p>En AstraJS, un componente es una funcion que retorna elementos del <strong>DOM real</strong>. No hay Virtual DOM: lo que retornas se inserta directamente en el documento. Esto significa que puedes usar <code>document.querySelector</code>, <code>addEventListener</code> nativo, y cualquier API del DOM directamente.</p>

        <h3>Componentes sin estado (funcion pura)</h3>
        <p>Si tu componente no necesita estado reactivo, simplemente escribe una funcion que retorne JSX. No necesitas <code>component()</code>:</p>
        <pre><code>{`// Funcion pura — sin estado, sin wrapping
function Greeting({ name }: { name: string }) {
  return <h2>Hola, {name}!</h2>;
}

// Uso directo:
document.body.appendChild(<Greeting name="Ada" /> as any);`}</code></pre>

        <h3>Componentes con estado (component wrapper)</h3>
        <p>Cuando necesitas estado reactivo, usa <code>component()</code>. La funcion que pasas se ejecuta <strong>una sola vez</strong>. La reactividad viene de los bindings individuales que el compilador genera — no de re-ejecutar el componente:</p>
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
          <strong>Importante:</strong> <code>component()</code> envuelve tu funcion en un <code>&lt;span style="display:contents"&gt;</code> invisible. Esto permite que el compilador detecte cuando el componente entra al DOM y dispare los callbacks de <code>mounted()</code>.
        </div>

        <h2>Reactividad con store</h2>
        <p><code>store()</code> es el corazon de la reactividad en AstraJS. Crea un <strong>Proxy de ES6</strong> que intercepta cada lectura y escritura de propiedades. No hay scheduler, no hay cola de updates, no hay batching manual — todo es automatico y transparente.</p>

        <h3>Como funciona el Proxy</h3>
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

        <h3>Arrays y colecciones</h3>
        <p>Los arrays dentro de un store tambien son reactivos. Las mutaciones como <code>push</code>, <code>splice</code>, y asignacion por indice disparan actualizaciones:</p>
        <pre><code>{`const app = store({
  items: ['A', 'B', 'C'],
  selected: null as string | null
});

// Mutaciones de array → reactivas
app.items.push('D');       // notifica a suscriptores de "items" y "items.length"
app.items[0] = 'Z';       // notifica a suscriptores de "items[0]"
app.items = [...app.items]; // reemplazo completo → notifica a suscriptores de "items"`}</code></pre>

        <h3>Auto-batching</h3>
        <p>Multiples mutaciones sincronas se agrupan automaticamente en un solo ciclo de actualizacion via <code>queueMicrotask()</code>. No necesitas <code>batch()</code> manual:</p>
        <pre><code>{`// Estas 3 mutaciones → 1 solo ciclo de DOM update
user.name = 'Grace';
user.age = 29;
user.profile.bio = 'Senior';

// Los efectos se ejecutan una vez, no tres.
// Los nodos del DOM se actualizan en un solo microtask.`}</code></pre>

        <h2>JSX sin VDOM</h2>
        <p>El compilador de AstraJS transforma JSX en operaciones directas de creacion de DOM. No hay <code>createElement</code> virtual, no hay fiber, no hay reconciliation.</p>

        <h3>La transformacion</h3>
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

        <h3>Expresiones condicionales</h3>
        <p>El compilador detecta operadores ternarios y logical AND/OR en expresiones JSX y los convierte en <code>bindConditional</code>:</p>
        <pre><code>{`// Escribes:
<div>{show && <span>Visible!</span>}</div>

// El compilador genera:
const marker = document.createComment('~');
bindConditional(marker, () => show, 
  () => <span>Visible!</span>
);
// Cuando show cambia, el <span> se inserta/remueve del DOM
// sin re-crear el <div> padre.`}</code></pre>

        <h3>Listas</h3>
        <p>El patron <code>array.map()</code> en JSX se transforma en <code>bindList</code> con diffing por keys para reconciliacion eficiente:</p>
        <pre><code>{`// Escribes:
<ul>
  {items.map(item => <li key={item.id}>{item.name}</li>)}
</ul>

// El compilador genera bindList con key-based diffing:
// - Items nuevos → se crean
// - Items removidos → se eliminan
// - Items reordenados → se mueven (sin re-crear)
// - Items con misma key → se preservan`}</code></pre>

        <h2>Estilos con css</h2>
        <p>El macro <code>css</code> permite definir estilos con ambito de componente. El compilador los extrae, les genera nombres unicos, y los inyecta en el documento. Soporta anidacion al estilo CSS-in-JS:</p>
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
        <p>Tambien puedes usar la utilidad <code>classes()</code> para componer clases condicionalmente:</p>
        <pre><code>{`import { classes } from '@astrajs/core';

<div class={classes(cardStyle, featured && 'featured', 'mb-4')}>
  ...
</div>`}</code></pre>

        <h2>Eventos resumibles</h2>
        <p>AstraJS introduce el concepto de <strong>eventos resumibles</strong>: los handlers de eventos se serializan en el HTML como referencias, y el codigo JavaScript correspondiente solo se descarga y ejecuta cuando el usuario interactua con el elemento. Esto permite paginas con 0 KB de JS hasta que el usuario hace clic.</p>
        <pre><code>{`// Eventos nativos — se ejecutan inmediatamente
<button onclick={() => state.count++}>
  Incrementar
</button>

// Eventos resumibles — el JS se carga JIT
<button astra-on:click={heavyHandler}>
  Accion compleja (codigo cargado on-demand)
</button>`}</code></pre>
        <div class="note">
          <strong>Diferencia clave:</strong> <code>onclick</code> empaqueta el handler en el bundle inicial. <code>astra-on:click</code> serializa una referencia y carga el codigo solo cuando el usuario hace clic. Ideal para interacciones poco frecuentes pero con logica pesada.
        </div>
      </div>
    </main>
  </div>
));
