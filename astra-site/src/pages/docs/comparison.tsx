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
  .docs-content table{width:100%;border-collapse:collapse;margin-bottom:24px;font-size:.82rem}
  .docs-content th{text-align:left;padding:10px 14px;background:rgba(255,255,255,.03);color:#e2e8f0;font-weight:700;border-bottom:2px solid rgba(255,255,255,.06)}
  .docs-content td{padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.04);color:#94a3b8}
  .docs-content td strong{color:#f7f7ff}
  .docs-content .win{color:#34d399;font-weight:700}
  .docs-content .lose{color:#f87171}
  .docs-content .neutral{color:#f59e0b}
`;

export const DocsComparison = component(() => (
  <div class="docs-layout">
    <style>{s}</style>
    <DocSidebar />
    <main class="docs-main">
      <div class="docs-content">
        <h1>Comparativa</h1>
        <p>Como se compara AstraJS con los frameworks mas populares del ecosistema JavaScript. Una comparacion objetiva basada en arquitectura, rendimiento, tamano de bundle, curva de aprendizaje, y experiencia de desarrollo.</p>

        <h2>Tabla comparativa</h2>
        <table>
          <tr><th></th><th><strong>AstraJS</strong></th><th>React</th><th>Vue.js</th><th>Angular</th></tr>
          <tr>
            <td><strong>Paradigma</strong></td>
            <td><span class="win">Zero-VDOM · DOM nativo</span></td>
            <td>Virtual DOM · Runtime</td>
            <td>Virtual DOM · Runtime</td>
            <td>Zone.js · Change Detection</td>
          </tr>
          <tr>
            <td><strong>Bundle inicial</strong></td>
            <td><span class="win">~3 KB (core)</span></td>
            <td>~42 KB (react + react-dom)</td>
            <td>~34 KB (vue runtime)</td>
            <td>~65 KB (core + common)</td>
          </tr>
          <tr>
            <td><strong>Actualizaciones</strong></td>
            <td><span class="win">O(1) quirurgicas</span></td>
            <td>O(n) diffing + reconciliacion</td>
            <td>O(n) diffing + reconciliacion</td>
            <td>O(n) change detection</td>
          </tr>
          <tr>
            <td><strong>Re-ejecucion</strong></td>
            <td><span class="win">Nunca — el componente corre 1 vez</span></td>
            <td>En cada cambio de estado</td>
            <td>En cada cambio de estado</td>
            <td>En cada ciclo de deteccion</td>
          </tr>
          <tr>
            <td><strong>Reactividad</strong></td>
            <td><span class="win">Proxy ES6 nativo</span></td>
            <td>Hooks + closures</td>
            <td>Proxy ES6 + ref/reactive</td>
            <td>Zone.js + decorators</td>
          </tr>
          <tr>
            <td><strong>TypeScript</strong></td>
            <td><span class="win">100% inferido e2e</span></td>
            <td>Anotaciones manuales</td>
            <td>Anotaciones manuales</td>
            <td>Integrado (obligatorio)</td>
          </tr>
          <tr>
            <td><strong>SSR/SSG/ISR</strong></td>
            <td><span class="win">Integrado, sin config</span></td>
            <td>Next.js (framework externo)</td>
            <td>Nuxt.js (framework externo)</td>
            <td>Angular Universal</td>
          </tr>
          <tr>
            <td><strong>Data Fetching</strong></td>
            <td><span class="win">server() RPC tipado</span></td>
            <td>useEffect + fetch / React Query</td>
            <td>onMounted + fetch / Vue Query</td>
            <td>HttpClient + Services</td>
          </tr>
          <tr>
            <td><strong>Routing</strong></td>
            <td><span class="win">Guards booleanos reactivos</span></td>
            <td>React Router (JSX/object)</td>
            <td>Vue Router (objeto de config)</td>
            <td>Angular Router (decorators)</td>
          </tr>
          <tr>
            <td><strong>Estilos</strong></td>
            <td><span class="win">css macro extraido en build</span></td>
            <td>CSS Modules / styled-components</td>
            <td>SFC scoped / CSS Modules</td>
            <td>SFC styles / ViewEncapsulation</td>
          </tr>
          <tr>
            <td><strong>Curva de aprendizaje</strong></td>
            <td><span class="win">Baja — conceptos minimos</span></td>
            <td>Media — hooks, reglas, memo</td>
            <td>Media — SFC, reactivity</td>
            <td>Alta — DI, decorators, RxJS</td>
          </tr>
          <tr>
            <td><strong>Build tool</strong></td>
            <td>Vite (plugin nativo)</td>
            <td>Vite / Webpack / Turbopack</td>
            <td>Vite (plugin nativo)</td>
            <td>esbuild + Angular CLI</td>
          </tr>
          <tr>
            <td><strong>Resumibilidad</strong></td>
            <td><span class="win">Si — nativa</span></td>
            <td>No — hidratacion</td>
            <td>No — hidratacion</td>
            <td>No — hidratacion</td>
          </tr>
        </table>

        <h2>React vs AstraJS</h2>
        <p>React es el framework mas popular del ecosistema. Su modelo basado en Virtual DOM y hooks revoluciono el desarrollo frontend. Sin embargo, tiene limitaciones arquitectonicas que AstraJS resuelve desde el diseno.</p>

        <h3>Virtual DOM vs DOM nativo</h3>
        <p>React mantiene una representacion virtual del DOM en memoria. Cuando el estado cambia, React re-ejecuta el componente, genera un nuevo VDOM, lo compara con el anterior (diffing), y aplica las diferencias al DOM real (reconciliacion). Este proceso es O(n) — proporcional al tamano del arbol de componentes.</p>
        <pre><code>{`// React: re-ejecucion del componente ENTERO
function Counter() {
  const [count, setCount] = useState(0);
  // TODO este cuerpo se ejecuta en cada render
  console.log('re-render'); // ← se imprime en cada click
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}

// AstraJS: el componente se ejecuta UNA VEZ
const Counter = component(() => {
  const state = store({ count: 0 });
  // Este codigo SOLO se ejecuta al montar
  console.log('mount'); // ← se imprime UNA vez
  
  return (
    <button onclick={() => state.count++}>
      Count: {state.count}
    </button>
    // Solo el TextNode de state.count se actualiza
  );
});`}</code></pre>

        <h3>Hooks vs store()</h3>
        <p>Los hooks de React tienen reglas estrictas: no pueden llamarse condicionalmente, requieren orden de llamado consistente, y necesitan <code>useCallback</code>/<code>useMemo</code> manual para evitar renders innecesarios. <code>store()</code> de AstraJS no tiene reglas — es un Proxy de JavaScript standard que podes usar en cualquier contexto.</p>
        <pre><code>{`// React: reglas de hooks, memoizacion manual
function SearchResults({ query }: { query: string }) {
  // ❌ No podes llamar hooks dentro de condicionales
  // ❌ Necesitas useCallback para referencias estables
  // ❌ Necesitas useMemo para valores derivados
  
  const results = useMemo(() => 
    searchData(query), [query]
  );
  const handleClick = useCallback((id: string) => {
    navigate('/item/' + id);
  }, [navigate]);
  
  return <ul>{results.map(r => <Item onClick={handleClick} />)}</ul>;
}

// AstraJS: sin reglas, sin memoizacion manual
function SearchResults({ query }: { query: string }) {
  // store() funciona en cualquier lado
  // El compilador memoiza automaticamente
  // Sin useCallback, sin useMemo
  
  const results = memo(() => searchData(query));
  
  return <ul>{results().map(r => <Item />)}</ul>;
}`}</code></pre>

        <h3>Next.js vs AstraJS full-stack</h3>
        <p>React necesita Next.js para SSR, SSG, ISR, y data fetching. Next.js agrega ~80 KB adicionales y su propia complejidad (App Router vs Pages Router, Server Components, 'use client', etc.). AstraJS ofrece todo esto integrado en ~3 KB de core — sin framework externo, sin decision fatigue.</p>

        <h2>Vue.js vs AstraJS</h2>
        <p>Vue comparte algunas ideas con AstraJS — reactividad basada en Proxy, SFCs, y un compilador que optimiza templates. Pero Vue sigue usando Virtual DOM para el diffing, lo que introduce overhead de runtime que AstraJS elimina completamente.</p>

        <h3>SFC vs funciones puras</h3>
        <p>Vue popularizo los Single-File Components (<code>.vue</code>), que combinan template, script y estilo en un archivo. AstraJS adopta un enfoque diferente: funciones TypeScript puras que retornan DOM. Los estilos se definen con <code>css``</code> en el mismo archivo <code>.tsx</code> — sin DSL propietario.</p>
        <pre><code>{`<!-- Vue SFC -->
<template>
  <button @click="increment">
    Count: {{ count }}
  </button>
</template>

<script setup>
import { ref } from 'vue';
const count = ref(0);
const increment = () => count.value++;
</script>

<style scoped>
button { background: #818cf8; }
</style>

// --- vs ---

// AstraJS TSX (mismo archivo)
import { component, store, css } from '@astrajs/core';

const btnStyle = css\`
  button { background: #818cf8; }
\`;

export const Counter = component(() => {
  const state = store({ count: 0 });
  return (
    <button class={btnStyle} onclick={() => state.count++}>
      Count: {state.count}
    </button>
  );
});`}</code></pre>

        <h3>reactivity transform vs store()</h3>
        <p>Vue requiere <code>.value</code> para acceder a refs en JavaScript (aunque en templates se auto-desenvuelve). Esto crea una discrepancia entre template y logica. AstraJS usa Proxies sin <code>.value</code> — la propiedad se accede igual en JSX y en JavaScript.</p>

        <h2>Angular vs AstraJS</h2>
        <p>Angular es un framework enterprise con baterias incluidas: dependency injection, RxJS, decorators, modulos, y un CLI completo. Su arquitectura es potente pero viene con una curva de aprendizaje pronunciada y un bundle base considerable.</p>

        <h3>Change Detection vs Granular Reactivity</h3>
        <p>Angular usa Zone.js para interceptar eventos asincronos y disparar ciclos de change detection. Por defecto, verifica cada binding en cada componente — O(n) en el peor caso. AstraJS usa suscripciones de grano fino: solo el binding que cambio se actualiza, siempre O(1).</p>
        <pre><code>{`// Angular: Zone.js intercepta setTimeout, HTTP, eventos...
// y dispara change detection en todo el arbol
@Component({
  template: \`<button (click)="increment()">
    Count: {{ count }}
  </button>\`
})
export class CounterComponent {
  count = 0;
  increment() { this.count++; }
  // Angular re-evalua TODOS los bindings del componente
}

// AstraJS: Proxy notifica solo al suscriptor exacto
const Counter = component(() => {
  const state = store({ count: 0 });
  return (
    <button onclick={() => state.count++}>
      Count: {state.count}
    </button>
    // Solo este TextNode se actualiza. Nada mas.
  );
});`}</code></pre>

        <h3>TypeScript</h3>
        <p>Angular fue pionero en adoptar TypeScript como lenguaje principal. Sin embargo, la inferencia de tipos entre cliente y servidor no es automatica — necesitas definir interfaces duplicadas o usar codegen. AstraJS infiere los tipos de las funciones <code>server()</code> y los propaga al cliente sin pasos extra.</p>

        <h2>Por que AstraJS es mejor</h2>
        <p>No se trata de que AstraJS sea "mejor" en terminos absolutos — cada framework tiene su lugar. Pero AstraJS toma decisiones arquitectonicas fundamentales que lo diferencian:</p>

        <h3>1. Zero Virtual DOM</h3>
        <p>React, Vue, y Angular todos usan alguna forma de representacion intermedia entre tu codigo y el DOM. AstraJS elimina esa capa completamente. Tu codigo compila a operaciones directas del DOM. Menos abstraccion, mas rendimiento, codigo mas predecible.</p>

        <h3>2. Full-stack sin framework externo</h3>
        <p>React necesita Next.js. Vue necesita Nuxt. Angular necesita Universal. AstraJS incluye SSR, SSG, ISR, y RPC en su nucleo de 3 KB. Un solo set de conceptos, una sola forma de hacer las cosas.</p>

        <h3>3. Tipos de extremo a extremo sin codegen</h3>
        <p>Ningun otro framework logra type safety completo entre cliente y servidor sin duplicar tipos, sin codegen, y sin herramientas externas. AstraJS lo hace automaticamente mediante el compilador AST.</p>

        <h3>4. Resumibilidad, no hidratacion</h3>
        <p>Todos los demas frameworks usan hidratacion: el cliente descarga todo el JS y re-ejecuta los componentes para hacer interactivo el HTML del servidor. AstraJS serializa el estado en el HTML y "reanuda" la aplicacion — el JS se carga solo cuando interactuas.</p>

        <h3>5. Curva de aprendizaje minima</h3>
        <p>AstraJS tiene 3 conceptos fundamentales: <code>store()</code>, <code>component()</code>, <code>server()</code>. No hay hooks, no hay reactivity transform, no hay decorators, no hay dependency injection, no hay modulos. JavaScript puro, TypeScript puro, DOM nativo.</p>

        <div class="note">
          <strong>En resumen:</strong> AstraJS no es "otro framework mas". Es un cambio de paradigma — de Virtual DOM y re-renders a compilacion AST y mutaciones quirurgicas del DOM. Si valoras el rendimiento, la simplicidad, y el type safety extremo a extremo, AstraJS es la opcion correcta.
        </div>
      </div>
    </main>
  </div>
));
