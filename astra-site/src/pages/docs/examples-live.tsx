/**
 * Live example components — each example renders as a real, working
 * AstraJS component inside the docs preview pane. Fullstack examples
 * simulate server behavior client-side (mock latency, ETags, etc.)
 * since the docs site is purely static.
 */
import { component, store, mounted } from 'astrajs.dev/core';
import { css } from 'astrajs.dev/compiler/css';
import { Icon } from '../../components/icon.js';

export interface LiveExample {
  num: string;
  title: string;
  description: string;
  concepts: string[];
  code: string;
  /** Snippet key for localized comments (optional). */
  commentsKey?: string;
  docsHref: string;
  render: () => JSX.Element;
}

/* ── Shared preview styles ─────────────────────────────────────────── */

const previewStyle = document.createElement('style');
previewStyle.textContent = `
  .lv{font-family:'Inter',sans-serif;color:#e2e8f0;display:flex;flex-direction:column;gap:12px}
  .lv h4{font-size:.95rem;font-weight:700;color:#f7f7ff}
  .lv p{font-size:.78rem;color:#94a3b8;line-height:1.6}
  .lv-btn{font-size:.76rem;font-weight:600;color:#fff;background:linear-gradient(135deg,#8d4dff,#4d7cff);border:none;border-radius:8px;padding:8px 18px;cursor:pointer;transition:transform .12s}
  .lv-btn:hover{transform:translateY(-1px)}
  .lv-btn:disabled{opacity:.4;cursor:not-allowed;transform:none}
  .lv-btn.ghost{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);color:#e2e8f0}
  .lv-input{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);border-radius:8px;padding:8px 12px;font-size:.78rem;color:#f7f7ff;outline:none;width:100%}
  .lv-input:focus{border-color:rgba(139,77,255,.5)}
  .lv-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:14px}
  .lv-list{display:flex;flex-direction:column;gap:6px}
  .lv-item{display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:8px;padding:8px 12px;font-size:.76rem}
  .lv-tag{display:inline-flex;font-size:.62rem;font-weight:600;color:#b84cff;background:rgba(139,77,255,.1);border:1px solid rgba(139,77,255,.2);padding:2px 8px;border-radius:10px}
  .lv-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
  .lv-err{color:#f87171;font-size:.72rem}
  .lv-ok{color:#34d399;font-size:.72rem}
  .lv-spin{display:inline-block;width:12px;height:12px;border:2px solid rgba(139,77,255,.2);border-top-color:#b84cff;border-radius:50%;animation:lvspin .8s linear infinite}
  @keyframes lvspin{to{transform:rotate(360deg)}}
  .lv-bar{height:6px;border-radius:3px;background:rgba(255,255,255,.06);overflow:hidden}
  .lv-bar-fill{height:100%;background:linear-gradient(90deg,#b84cff,#4d7cff);border-radius:3px;transition:width .2s}
`;
if (typeof document !== 'undefined') {
  document.head.appendChild(previewStyle);
}

/* ── Frontend examples ─────────────────────────────────────────────── */

const ex01 = component(() => {
  const counter = store({ value: 0 });
  return (
    <div class="lv">
      <h4>Contador reactivo</h4>
      <div class="lv-card" style="text-align:center">
        <div style="font-size:2.2rem;font-weight:800;color:#fff;margin:8px 0">{counter.value}</div>
        <div class="lv-row" style="justify-content:center">
          <button class="lv-btn" onclick={() => counter.value--}>− 1</button>
          <button class="lv-btn" onclick={() => counter.value++}>+ 1</button>
        </div>
      </div>
      <p><Icon name="clock" size={13} /> Solo el número se actualiza. El componente no se re-ejecuta.</p>
    </div>
  );
});

const cartStore = store({ items: 0 });
const ex02 = component(() => (
  <div class="lv">
    <h4>Store compartido entre componentes</h4>
    <div class="lv-card">
      <div class="lv-row" style="justify-content:space-between">
        <span class="lv-tag">Componente A (Header)</span>
        <button class="lv-btn" onclick={() => cartStore.items++}>Agregar item</button>
      </div>
    </div>
    <div class="lv-card">
      <div class="lv-row" style="justify-content:space-between">
        <span class="lv-tag">Componente B (Badge)</span>
        <strong style="color:#fff"><Icon name="cart" size={14} /> {cartStore.items} items</strong>
      </div>
    </div>
    <p>Sin context, sin props drilling — el store es el canal único.</p>
  </div>
));

const ex03 = component(() => {
  const form = store({ name: '', email: '' });
  return (
    <div class="lv">
      <h4>Formulario con two-way binding</h4>
      <input class="lv-input" placeholder="Tu nombre"
        value={form.name}
        onInput={(e: Event) => { form.name = (e.target as HTMLInputElement).value; }} />
      <input class="lv-input" placeholder="Tu email"
        value={form.email}
        onInput={(e: Event) => { form.email = (e.target as HTMLInputElement).value; }} />
      <div class="lv-card">
        <p>Hola, <strong style="color:#fff">{form.name || 'anónimo'}</strong>!</p>
        {form.email && <p class="lv-ok">Email: {form.email}</p>}
      </div>
    </div>
  );
});

const ex04 = component(() => {
  const nav = store({ page: 'home' as string });
  return (
    <div class="lv">
      <h4>Router con guards booleanos</h4>
      <div class="lv-row">
        <button class={`lv-btn ${nav.page === 'home' ? '' : 'ghost'}`} onclick={() => { nav.page = 'home'; }}>Home</button>
        <button class={`lv-btn ${nav.page === 'about' ? '' : 'ghost'}`} onclick={() => { nav.page = 'about'; }}>About</button>
        <button class={`lv-btn ${nav.page === '404' ? '' : 'ghost'}`} onclick={() => { nav.page = '404'; }}>Ruta inválida</button>
      </div>
      <div class="lv-card">
        {nav.page === 'home' && <p><Icon name="home" size={13} /> Home — route('/', {'{ exact: true }'})</p>}
        {nav.page === 'about' && <p><Icon name="info" size={13} /> About — route('/about')</p>}
        {nav.page === '404' && <p class="lv-err">404 — fallbackRoute()</p>}
      </div>
    </div>
  );
});

const cardStyle = css`
  .demo-card {
    background: #0f172a;
    border: 1px solid #1e293b;
    border-radius: 12px;
    padding: 20px;
    transition: border-color .2s, transform .2s;
    cursor: pointer;
  }
  .demo-card:hover {
    border-color: #818cf8;
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(139, 77, 255, .15);
  }
`;
const ex05 = component(() => (
  <div class="lv">
    <h4>CSS con ámbito (hover sobre la tarjeta)</h4>
    <div class="demo-card">
      <p><strong style="color:#fff">Tarjeta con css`` macro</strong></p>
      <p>El estilo está extraído en build time y el hover solo afecta a este componente.</p>
    </div>
    <style>{cardStyle}</style>
  </div>
));

const ex06 = component(() => {
  const app = store({
    show: true,
    items: [{ id: 1, name: 'Alpha' }, { id: 2, name: 'Beta' }] as { id: number; name: string }[],
    nextId: 3,
  });
  return (
    <div class="lv">
      <h4>Condicionales y listas</h4>
      <div class="lv-row">
        <button class={`lv-btn ${app.show ? '' : 'ghost'}`} onclick={() => { app.show = !app.show; }}>
          {app.show ? 'Ocultar lista' : 'Mostrar lista'}
        </button>
        <button class="lv-btn" onclick={() => { app.items.push({ id: app.nextId, name: `Item ${app.nextId}` }); app.nextId++; }}>
          + Agregar
        </button>
        <button class="lv-btn ghost" onclick={() => { app.items.pop(); }}>
          − Quitar
        </button>
      </div>
      {app.show && (
        <div class="lv-list">
          {app.items.map((item) => (
            <div class="lv-item">
              <span>{item.name}</span>
              <span class="lv-tag">id: {item.id}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

const ex07 = component(() => {
  const state = store({
    data: [] as string[],
    loading: false,
  });
  const load = () => {
    state.loading = true;
    state.data = [];
    setTimeout(() => {
      state.data = ['Dato A', 'Dato B', 'Dato C'];
      state.loading = false;
    }, 900);
  };
  return (
    <div class="lv">
      <h4>Carga asíncrona (mounted + fetch simulado)</h4>
      <button class="lv-btn" onclick={load} disabled={state.loading}>
        {state.loading ? 'Cargando...' : 'Cargar datos'}
      </button>
      <div class="lv-card">
        {state.loading ? (
          <div class="lv-row"><span class="lv-spin"></span><p>Cargando datos del servidor...</p></div>
        ) : state.data.length === 0 ? (
          <p>Sin datos. Pulsa "Cargar datos".</p>
        ) : (
          <div class="lv-list">
            {state.data.map((d) => <div class="lv-item"><span>{d}</span><span class="lv-ok"><Icon name="check" size={12} /></span></div>)}
          </div>
        )}
      </div>
    </div>
  );
});

const ex08 = component(() => {
  const state = store({ time: '' });
  mounted(() => {
    const tick = () => { state.time = new Date().toLocaleTimeString(); };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  });
  return (
    <div class="lv">
      <h4>Lifecycle: mounted() + cleanup</h4>
      <div class="lv-card" style="text-align:center">
        <div style="font-size:1.6rem;font-weight:800;color:#fff">{state.time}</div>
        <p>setInterval creado en mounted(), limpio automáticamente al desmontar.</p>
      </div>
    </div>
  );
});

const ex09 = component(() => (
  <div class="lv">
    <h4>Composición: props + children</h4>
    <div class="lv-card" style="border:1px dashed rgba(139,77,255,.3)">
      <p><strong style="color:#fff">Layout {'{title}'}</strong></p>
      <div class="lv-card" style="margin-top:8px">
        <p>children renderizados dentro del layout</p>
      </div>
    </div>
    <p>Componentes puros = funciones que retornan DOM real.</p>
  </div>
));

const ex10 = component(() => {
  const ui = store({ active: false });
  return (
    <div class="lv">
      <h4>Atributos dinámicos (bindAttr)</h4>
      <div class="lv-row">
        <button class={`lv-btn ${ui.active ? '' : 'ghost'}`} onclick={() => { ui.active = !ui.active; }}>
          Toggle active
        </button>
      </div>
      <div class="lv-card" style={ui.active ? 'border-color:#b84cff;box-shadow:0 0 16px rgba(184,76,255,.25)' : ''}>
        <p class={ui.active ? 'lv-ok' : ''}>{ui.active && <span><Icon name="check" size={12} /> Activo</span>}{!ui.active && <span><Icon name="square" size={12} /> Inactivo</span>}</p>
      </div>
      <button class="lv-btn" disabled={!ui.active}>
        {ui.active ? 'Botón habilitado' : 'Botón deshabilitado (disabled={!active})'}
      </button>
    </div>
  );
});

/* ── Fullstack examples (server behavior simulated) ────────────────── */

const ex11 = component(() => {
  const state = store({ users: [] as string[], loading: false });
  const load = () => {
    state.loading = true;
    state.users = [];
    setTimeout(() => {
      state.users = ['Ada', 'Grace', 'Linus'];
      state.loading = false;
    }, 700);
  };
  return (
    <div class="lv">
      <h4>server({'{ type: "dynamic" }'}) — RPC simulado</h4>
      <button class="lv-btn" onclick={load} disabled={state.loading}>
        {state.loading ? 'Ejecutando en servidor...' : 'getUsers()'}
      </button>
      <div class="lv-card">
        {state.users.length > 0 ? (
          <div class="lv-list">
            {state.users.map((u) => <div class="lv-item"><span>{u}</span><span class="lv-tag">User</span></div>)}
          </div>
        ) : (
          <p>
            {state.loading && <span><Icon name="loader" size={13} /> RPC en vuelo...</span>}
            {!state.loading && <span>Llama a getUsers() — el compilador generó el stub fetch + handler.</span>}
          </p>
        )}
      </div>
    </div>
  );
});

const ex12 = component(() => {
  const state = store({ status: 'idle' as string, version: 0 });
  const load = () => {
    if (state.status === 'loading') return;
    state.status = 'cached';
    setTimeout(() => {
      state.status = 'revalidated';
      state.version++;
      setTimeout(() => { state.status = 'idle'; }, 1500);
    }, 500);
  };
  return (
    <div class="lv">
      <h4>SWR: stale-while-revalidate</h4>
      <button class="lv-btn" onclick={load}>getProducts()</button>
      <div class="lv-card">
        {state.status === 'idle' && <p>Haz clic para consumir la API.</p>}
        {state.status === 'cached' && <p class="lv-ok"><Icon name="bolt" size={13} /> Respuesta instantánea desde caché (SWR)...</p>}
        {state.status === 'revalidated' && <p class="lv-ok"><Icon name="refresh" size={13} /> Revalidado en background — v{state.version}</p>}
      </div>
      <p>Primera llamada: red. Luego: caché + revalidación silenciosa.</p>
    </div>
  );
});

const ex13 = component(() => {
  const form = store({ title: '', body: '', sent: false });
  return (
    <div class="lv">
      <h4>Mutación tipada al servidor</h4>
      <input class="lv-input" placeholder="Título" value={form.title}
        onInput={(e: Event) => { form.title = (e.target as HTMLInputElement).value; }} />
      <input class="lv-input" placeholder="Contenido" value={form.body}
        onInput={(e: Event) => { form.body = (e.target as HTMLInputElement).value; }} />
      <button class="lv-btn" disabled={!form.title || !form.body}
        onclick={() => { form.sent = true; }}>
        createPost()
      </button>
      {form.sent && (
        <div class="lv-card">
          <p class="lv-ok"><Icon name="check" size={13} /> Post creado en el servidor</p>
          <p><strong style="color:#fff">{form.title}</strong> — {form.body}</p>
          <p>Tags ['posts'] revalidados automáticamente.</p>
        </div>
      )}
    </div>
  );
});

const ex14 = component(() => {
  const state = store({ selected: null as number | null });
  const products = [
    { id: 1, name: 'Auriculares', price: 49 },
    { id: 2, name: 'Teclado', price: 129 },
    { id: 3, name: 'Monitor', price: 349 },
  ];
  return (
    <div class="lv">
      <h4>params.id → server({'{ id }'})</h4>
      <div class="lv-row">
        {products.map((p) => (
          <button class={`lv-btn ${state.selected === p.id ? '' : 'ghost'}`}
            onclick={() => { state.selected = p.id; }}>
            #{p.id}
          </button>
        ))}
      </div>
      <div class="lv-card">
        {state.selected === null ? (
          <p>Selecciona un id — la ruta sería /products/:id</p>
        ) : (
          (() => {
            const p = products.find((x) => x.id === state.selected)!;
            return (
              <div>
                <p><strong style="color:#fff">{p.name}</strong></p>
                <p>Precio: ${p.price} — cargado con getProduct(params.id)</p>
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
});

const ex15 = component(() => {
  const form = store({ name: '', email: '', age: '' });
  const errors = () => {
    const e: string[] = [];
    if (form.name.length > 0 && form.name.length < 2) e.push('Nombre: mínimo 2 caracteres');
    if (form.email && !/^[^@]+@[^@]+$/.test(form.email)) e.push('Email inválido');
    if (form.age && Number(form.age) < 18) e.push('Edad: mínimo 18');
    return e;
  };
  const errs = errors();
  return (
    <div class="lv">
      <h4>Schema validation en vivo</h4>
      <input class="lv-input" placeholder="Nombre (min 2)" value={form.name}
        onInput={(e: Event) => { form.name = (e.target as HTMLInputElement).value; }} />
      <input class="lv-input" placeholder="Email" value={form.email}
        onInput={(e: Event) => { form.email = (e.target as HTMLInputElement).value; }} />
      <input class="lv-input" placeholder="Edad (min 18)" value={form.age}
        onInput={(e: Event) => { form.age = (e.target as HTMLInputElement).value; }} />
      {errs.length === 0 ? (
        <p class="lv-ok"><Icon name="check" size={13} /> Sin errores — schema validado</p>
      ) : (
        errs.map((e) => <p class="lv-err"><Icon name="x" size={12} /> {e}</p>)
      )}
    </div>
  );
});

const ex16 = component(() => {
  const todos = store({
    items: [
      { id: 1, text: 'Aprender AstraJS', done: true },
      { id: 2, text: 'Construir mi app', done: false },
    ] as { id: number; text: string; done: boolean }[],
  });
  const toggle = (id: number) => {
    const item = todos.items.find((t) => t.id === id)!;
    const prev = item.done;
    item.done = !prev; // optimistic
    setTimeout(() => {
      // server responds ok — no changes
      if (Math.random() < 0.2) {
        item.done = prev; // simulated rollback
      }
    }, 500);
  };
  return (
    <div class="lv">
      <h4>Mutaciones optimistas + rollback</h4>
      <div class="lv-list">
        {todos.items.map((t) => (
          <div class="lv-item" style="cursor:pointer" onclick={() => toggle(t.id)}>
            <span style={t.done ? 'text-decoration:line-through;color:#64748b' : ''}>{t.text}</span>
            <span>{t.done && <Icon name="check" size={14} />}{!t.done && <Icon name="square" size={14} />}</span>
          </div>
        ))}
      </div>
      <p>Click en un todo: la UI cambia al instante; el servidor confirma en background. ~20% de fallos → rollback automático.</p>
    </div>
  );
});

const ex17 = component(() => {
  const state = store({ file: null as { name: string; size: number } | null, progress: 0, done: false });
  return (
    <div class="lv">
      <h4>Subida de archivos (multipart)</h4>
      <input
        class="lv-input"
        type="file"
        onChange={(e: Event) => {
          const f = (e.target as HTMLInputElement).files?.[0];
          if (!f) return;
          state.file = { name: f.name, size: f.size };
          state.progress = 0;
          state.done = false;
          const timer = setInterval(() => {
            state.progress += 20;
            if (state.progress >= 100) {
              clearInterval(timer);
              state.done = true;
            }
          }, 200);
        }}
      />
      {state.file && (
        <div class="lv-card">
          <p><strong style="color:#fff">{state.file.name}</strong> — {(state.file.size / 1024).toFixed(1)} KB</p>
          <div class="lv-bar" style="margin-top:8px">
            <div class="lv-bar-fill" style={`width:${state.progress}%`}></div>
          </div>
          {state.done && <p class="lv-ok"><Icon name="check" size={13} /> Subido al servidor</p>}
        </div>
      )}
    </div>
  );
});

const ex18 = component(() => {
  const state = store({ sales: 1240, syncs: 0, syncing: false });
  mounted(() => {
    const timer = setInterval(() => {
      state.syncing = true;
      setTimeout(() => {
        state.sales += Math.floor(Math.random() * 50);
        state.syncs++;
        state.syncing = false;
      }, 400);
    }, 2500);
    return () => clearInterval(timer);
  });
  return (
    <div class="lv">
      <h4>autoSync con ETags</h4>
      <div class="lv-card">
        <div style="font-size:1.4rem;font-weight:800;color:#fff">${state.sales}</div>
        <p>Ventas en tiempo real</p>
      </div>
      <div class="lv-row">
        {state.syncing && <span class="lv-tag"><Icon name="loader" size={11} /> Sincronizando...</span>}
        {!state.syncing && <span class="lv-tag"><Icon name="check" size={11} /> Sincronizado</span>}
        <span class="lv-tag">syncs: {state.syncs}</span>
      </div>
      <p>Polling con If-None-Match — el servidor responde 304 si no hay cambios.</p>
    </div>
  );
});

const ex19 = component(() => {
  const state = store({ resumed: false });
  return (
    <div class="lv">
      <h4>Resumibilidad: el estado vive en el HTML</h4>
      <div class="lv-card">
        <p>HTML enviado por el servidor:</p>
        <pre style="font-size:.66rem;color:#00dfff;background:#04060d;padding:10px;border-radius:6px;margin:8px 0">{"<div astra-data='{\"items\":3,\"total\":42,\"user\":\"Ada\"}'"}<br/><button astra-on:click>Checkout</button></pre>
      </div>
      <button class="lv-btn" onclick={() => { state.resumed = true; }}>
        resume()
      </button>
      {state.resumed && (
        <div class="lv-card">
          <p class="lv-ok"><Icon name="check" size={13} /> App reanudada — sin re-ejecutar componentes, sin hidratación.</p>
          <div class="lv-list">
            <div class="lv-item"><span>items</span><span>3</span></div>
            <div class="lv-item"><span>total</span><span>$42</span></div>
            <div class="lv-item"><span>user</span><span>Ada</span></div>
          </div>
        </div>
      )}
    </div>
  );
});

const ex20 = component(() => {
  const builtAt = '2026-08-12T09:00:00Z';
  const posts = [
    { title: 'Zero Virtual DOM', views: 1240 },
    { title: 'Typed RPC', views: 890 },
    { title: 'Resumability', views: 632 },
  ];
  return (
    <div class="lv">
      <h4>SSG: pre-build — 0 KB de JS</h4>
      <div class="lv-card">
        <p>Datos incrustados en el HTML durante el build:</p>
        <div class="lv-list" style="margin-top:8px">
          {posts.map((p) => (
            <div class="lv-item">
              <span>{p.title}</span>
              <span class="lv-tag">{p.views} vistas</span>
            </div>
          ))}
        </div>
      </div>
      <p><Icon name="clock" size={13} /> Build time: {builtAt} — esta página no hizo ningún fetch: los datos ya estaban en el HTML.</p>
    </div>
  );
});

/* ── Registro de ejemplos ──────────────────────────────────────────── */

export const frontendExamples: LiveExample[] = [
  { num: '01', title: 'ex1.title', description: 'ex1.desc', concepts: ['store()', 'component()'], docsHref: '/docs/fundamentals#reactividad', render: ex01,
    code: `const counter = store({ value: 0 });

export const Counter = component(() => (
  <div>
    <h2>Counter: {counter.value}</h2>
    <button onclick={() => counter.value--}>-1</button>
    <button onclick={() => counter.value++}>+1</button>
  </div>
));` },
  { num: '02', title: 'ex2.title', description: 'ex2.desc', concepts: ['store compartido'], docsHref: '/docs/fundamentals#reactividad', render: ex02,
    code: `// store.ts — shared module
export const cart = store({ items: 0 });

// Component A
<button onclick={() => cart.items++}>
  Add ({cart.items})
</button>

// Component B — updates itself
<p>{cart.items} items</p>`,
    commentsKey: 'ex02' },
  { num: '03', title: 'ex3.title', description: 'ex3.desc', concepts: ['bindValue', 'onInput'], docsHref: '/docs/fundamentals#eventos', render: ex03,
    code: `const form = store({ name: '', email: '' });

<input
  value={form.name}
  onInput={(e) => { form.name = e.target.value; }}
/>

<p>Hello, {form.name}!</p>` },
  { num: '04', title: 'ex4.title', description: 'ex4.desc', concepts: ['route()', 'fallbackRoute()'], docsHref: '/docs/router#rutas', render: ex04,
    code: `export const routes = {
  get home()     { return route('/', { exact: true }); },
  get about()    { return route('/about'); },
  get fallback() { return fallbackRoute(); },
};

{routes.home     && <HomePage />}
{routes.about    && <AboutPage />}
{routes.fallback && <NotFound />}` },
  { num: '05', title: 'ex5.title', description: 'ex5.desc', concepts: ['css``', 'scope'], docsHref: '/docs/fundamentals#estilos', render: ex05,
    code: `const cardStyle = css\`
  .demo-card {
    background: #0f172a;
    border-radius: 12px;
    padding: 20px;
  }
  .demo-card:hover {
    border-color: #818cf8;
    transform: translateY(-3px);
  }
\`;

<div class="demo-card">...</div>` },
  { num: '06', title: 'ex6.title', description: 'ex6.desc', concepts: ['bindConditional', 'bindList'], docsHref: '/docs/fundamentals#jsx-sin-vdom', render: ex06,
    code: `const app = store({ show: true, items: [...] });

{app.show && <span>Visible!</span>}

<ul>
  {app.items.map(item => (
    <li key={item.id}>{item.name}</li>
  ))}
</ul>` },
  { num: '07', title: 'ex7.title', description: 'ex7.desc', concepts: ['mounted()', 'async'], docsHref: '/docs/fundamentals#componentes', render: ex07,
    code: `const state = store({ data: [], loading: true });

mounted(() => {
  fetch('/api/data')
    .then(r => r.json())
    .then(data => {
      state.data = data;
      state.loading = false;
    });
});

{state.loading
  ? <p>Loading...</p>
  : <List data={state.data} />}` },
  { num: '08', title: 'ex8.title', description: 'ex8.desc', concepts: ['mounted()', 'cleanup'], docsHref: '/docs/fundamentals#componentes', render: ex08,
    code: `export const Clock = component(() => {
  const state = store({ time: '' });

  mounted(() => {
    const timer = setInterval(() => {
      state.time = new Date().toLocaleTimeString();
    }, 1000);
    return () => clearInterval(timer); // auto-cleanup
  });

  return <p>{state.time}</p>;
});`,
    commentsKey: 'ex08',
    },
  { num: '09', title: 'ex9.title', description: 'ex9.desc', concepts: ['props', 'children'], docsHref: '/docs/fundamentals#componentes', render: ex09,
    code: `function Layout({ title, children }: {
  title: string;
  children: JSX.Element;
}) {
  return (
    <div>
      <header>{title}</header>
      <main>{children}</main>
    </div>
  );
}

<Layout title="My App">
  <p>Content</p>
</Layout>` },
  { num: '10', title: 'ex10.title', description: 'ex10.desc', concepts: ['bindAttr', 'bindClass'], docsHref: '/docs/fundamentals#jsx-sin-vdom', render: ex10,
    code: `const ui = store({ active: false });

<div class={ui.active ? 'card active' : 'card'}>
  <button disabled={!ui.active}>Send</button>
</div>

// Only the class/disabled changes
// on the affected node. Nothing else.`,
    commentsKey: 'ex10' },
];

export const fullstackExamples: LiveExample[] = [
  { num: '01', title: 'ex11.title', description: 'ex11.desc', concepts: ['server()', 'RPC'], docsHref: '/docs/server-data#tipos-server', render: ex11,
    code: `export const getUsers = server(
  { type: 'dynamic', tags: ['users'] },
  async () => {
    return db.user.findMany();
  }
);

// Client — typed RPC:
const users = await getUsers();
// users: User[] — automatic e2e types`,
    commentsKey: 'ex11' },
  { num: '02', title: 'ex12.title', description: 'ex12.desc', concepts: ['swr', 'maxAge'], docsHref: '/docs/server-data#caching', render: ex12,
    code: `export const getProducts = server(
  { tags: ['products'], maxAge: 300 },
  async () => db.product.findMany()
);

// 1st fetch → network + cache
// Subsequent → instant cache (SWR)
// Expired → stale + background revalidation`,
    commentsKey: 'ex12' },
  { num: '03', title: 'ex13.title', description: 'ex13.desc', concepts: ['server()', 'mutations'], docsHref: '/docs/server-data#server', render: ex13,
    code: `const createPost = server(
  { tags: ['posts'] },
  async (data: { title: string; body: string }) => {
    return db.post.create({ data });
  }
);

await createPost({ title, body });
// ['posts'] tags revalidated automatically`,
    commentsKey: 'ex13' },
  { num: '04', title: 'ex14.title', description: 'ex14.desc', concepts: ['params', 'server()'], docsHref: '/docs/router#rutas', render: ex14,
    code: `export const routes = {
  get product() { return route('/products/:id'); },
};

export const getProduct = server(
  { tags: ['products'] },
  async (id: string) => {
    return db.product.findUnique({ where: { id } });
  }
);

const p = await getProduct(params.id);` },
  { num: '05', title: 'ex15.title', description: 'ex15.desc', concepts: ['schema', 'validation'], docsHref: '/docs/server-data#server', render: ex15,
    code: `const UserSchema = schema.object({
  name: schema.string().min(2),
  email: schema.string().email(),
  age: schema.number().min(18).optional(),
});

// Client:
const result = UserSchema.validate(formData);

// Server:
const valid = UserSchema.validate(data);
if (!valid.success) return { errors: valid.errors };`,
    commentsKey: 'ex15' },
  { num: '06', title: 'ex16.title', description: 'ex16.desc', concepts: ['optimistic', 'rollback'], docsHref: '/docs/server-data#caching', render: ex16,
    code: `async function handleToggle(id: string) {
  const item = todos.find(t => t.id === id)!;
  const prev = item.done;
  item.done = !prev; // optimistic

  try {
    await toggleTodo(id); // server
  } catch {
    item.done = prev; // rollback
  }
}`,
    commentsKey: 'ex16',
    },
  { num: '07', title: 'ex17.title', description: 'ex17.desc', concepts: ['upload', 'FormData'], docsHref: '/docs/server-data#server', render: ex17,
    code: `const uploadFile = server(
  { tags: ['files'] },
  async (file: File) => {
    const buffer = await file.arrayBuffer();
    return storage.put(buffer, file.name);
  }
);

<input type="file"
  onChange={async (e) => {
    const f = e.target.files?.[0];
    if (f) await uploadFile(f);
  }} />` },
  { num: '08', title: 'ex18.title', description: 'ex18.desc', concepts: ['autoSync', 'ETags'], docsHref: '/docs/server-data#autosync', render: ex18,
    code: `export const liveStats = server(
  { autoSync: true, autoSyncInterval: 2500 },
  async () => db.stats.latest()
);

// The DOM updates only when the
// server returns new data.
// No WebSockets, no subscriptions.`,
    commentsKey: 'ex18' },
  { num: '09', title: 'ex19.title', description: 'ex19.desc', concepts: ['resume()', 'SSR'], docsHref: '/docs/rendering#resumibilidad', render: ex19,
    code: `// Server HTML:
<div astra-data="{&quot;items&quot;:3,&quot;total&quot;:42}">
  3 items · $42
</div>
<button astra-on:click>Checkout</button>

// Client: resume()
// 1. astra-data → state restored from the HTML
// 2. astra-on:click → delegated listener, nothing re-runs
// 3. Handlers load on-demand`,
    commentsKey: 'ex19' },
  { num: '10', title: 'ex20.title', description: 'ex20.desc', concepts: ['SSG', 'pre-build'], docsHref: '/docs/rendering#ssg', render: ex20,
    code: `export const getPosts = server(
  { type: 'pre-build', tags: ['posts'] },
  async () => db.post.findMany()
);

// Build time: query executed
// HTML: embedded data (astra-data)
// Client: 0 fetch, 0 KB of JS`,
    commentsKey: 'ex20' },
];
