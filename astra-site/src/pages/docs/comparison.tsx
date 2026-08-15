import { component, dynamic } from '@astrajs/core';
import { DocSidebar } from '../../components/docs-sidebar.js';
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
  .docs-content table{width:100%;border-collapse:collapse;margin-bottom:24px;font-size:.82rem}
  @media(max-width:960px){.docs-content table{display:block;overflow-x:auto;max-width:100%}}
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
        <h1>{i18n.t('sb.compare')}</h1>
        <p>{i18n.t('cp.hero')}</p>

        <h2>{i18n.t('cp.table.title')}</h2>
        <table>
          <tr><th></th><th><strong>AstraJS</strong></th><th>React</th><th>Vue.js</th><th>Angular</th></tr>
          {[
            ['cp.r1', 'cp.a1', 'cp.rx1', 'cp.v1', 'cp.ng1'],
            ['cp.r2', 'cp.a2', 'cp.rx2', 'cp.v2', 'cp.ng2'],
            ['cp.r3', 'cp.a3', 'cp.rx3', 'cp.v3', 'cp.ng3'],
            ['cp.r4', 'cp.a4', 'cp.rx4', 'cp.v4', 'cp.ng4'],
            ['cp.r5', 'cp.a5', 'cp.rx5', 'cp.v5', 'cp.ng5'],
            ['cp.r6', 'cp.a6', 'cp.rx6', 'cp.v6', 'cp.ng6'],
            ['cp.r7', 'cp.a7', 'cp.rx7', 'cp.v7', 'cp.ng7'],
            ['cp.r8', 'cp.a8', 'cp.rx8', 'cp.v8', 'cp.ng8'],
            ['cp.r9', 'cp.a9', 'cp.rx9', 'cp.v9', 'cp.ng9'],
            ['cp.r10', 'cp.a10', 'cp.rx10', 'cp.v10', 'cp.ng10'],
            ['cp.r11', 'cp.a11', 'cp.rx11', 'cp.v11', 'cp.ng11'],
            ['cp.r12', 'cp.a12', 'cp.rx12', 'cp.v12', 'cp.ng12'],
            ['cp.r13', 'cp.a13', 'cp.rx13', 'cp.v13', 'cp.ng13'],
          ].map((row) => (
            <tr>
              <td><strong>{i18n.t(row[0])}</strong></td>
              <td><span class="win">{i18n.t(row[1])}</span></td>
              <td>{i18n.t(row[2])}</td>
              <td>{i18n.t(row[3])}</td>
              <td>{i18n.t(row[4])}</td>
            </tr>
          ))}
        </table>

        <h2 id="react-vs">React vs AstraJS</h2>
        <p>{i18n.t('cp.react.p')}</p>

        <h3>{i18n.t('cp.react.vdom.title')}</h3>
        <p>{i18n.t('cp.react.vdom.p')}</p>
        <CodeBlock code={`// React: the ENTIRE component re-executes
function Counter() {
  const [count, setCount] = useState(0);
  // This whole body runs on every render
  console.log('re-render'); // ← prints on every click
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}

// AstraJS: the component runs ONCE
const Counter = component(() => {
  const state = store({ count: 0 });
  // This code runs ONLY on mount
  console.log('mount'); // ← prints ONCE
  
  return (
    <button onclick={() => state.count++}>
      Count: {state.count}
    </button>
    // Only the state.count TextNode updates
  );
});`} commentsKey="comparison.react-rerender" />

        <h3>{i18n.t('cp.react.hooks.title')}</h3>
        <p>{i18n.t('cp.hooks.a')}<code>useCallback</code>{i18n.t('cp.hooks.b')}<code>useMemo</code>{i18n.t('cp.hooks.c')}<code>store()</code>{i18n.t('cp.hooks.d')}</p>
        <CodeBlock code={`// React: hook rules, manual memoization
function SearchResults({ query }: { query: string }) {
  // You can't call hooks inside conditionals
  // You need useCallback for stable references
  // You need useMemo for derived values
  
  const results = useMemo(() => 
    searchData(query), [query]
  );
  const handleClick = useCallback((id: string) => {
    navigate('/item/' + id);
  }, [navigate]);
  
  return <ul>{results.map(r => <Item onClick={handleClick} />)}</ul>;
}

// AstraJS: no rules, no manual memoization
function SearchResults({ query }: { query: string }) {
  // store() works anywhere
  // The compiler memoizes automatically
  // No useCallback, no useMemo
  
  const results = memo(() => searchData(query));
  
  return <ul>{results().map(r => <Item />)}</ul>;
}`} commentsKey="comparison.react-hooks" />

        <h3>{i18n.t('cp.react.next.title')}</h3>
        <p>{i18n.t('cp.react.next.p')}</p>

        <h2 id="vue-vs">Vue.js vs AstraJS</h2>
        <p>{i18n.t('cp.vue.p')}</p>

        <h3>{i18n.t('cp.vue.sfc.title')}</h3>
        <p>{i18n.t('cp.sfc.a')}<code>.vue</code>{i18n.t('cp.sfc.b')}<code>css</code>{i18n.t('cp.sfc.c')}<code>.tsx</code>{i18n.t('cp.sfc.d')}</p>
        <CodeBlock code={`<!-- Vue SFC -->
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

// AstraJS TSX (same file)
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
});`} commentsKey="comparison.vue" />

        <h3>{i18n.t('cp.vue.react.title')}</h3>
        <p>{i18n.t('cp.vr.a')}<code>.value</code>{i18n.t('cp.vr.b')}<code>.value</code>{i18n.t('cp.vr.c')}</p>

        <h2 id="angular-vs">Angular vs AstraJS</h2>
        <p>{i18n.t('cp.angular.p')}</p>

        <h3>{i18n.t('cp.angular.cd.title')}</h3>
        <p>{i18n.t('cp.angular.cd.p')}</p>
        <CodeBlock code={`// Angular: Zone.js intercepts setTimeout, HTTP, events...
// and triggers change detection across the whole tree
@Component({
  template: \`<button (click)="increment()">
    Count: {{ count }}
  </button>\`
})
export class CounterComponent {
  count = 0;
  increment() { this.count++; }
  // Angular re-evaluates ALL bindings in the component
}

// AstraJS: the Proxy notifies only the exact subscriber
const Counter = component(() => {
  const state = store({ count: 0 });
  return (
    <button onclick={() => state.count++}>
      Count: {state.count}
    </button>
    // Only this TextNode updates. Nothing else.
  );
});`} commentsKey="comparison.angular-cd" />

        <h3>{i18n.t('cp.angular.ts.title')}</h3>
        <p>{i18n.t('cp.angular.ts.p')}<code>server()</code>{i18n.t('cp.angular.ts.p2')}</p>

        <h2>{i18n.t('cp.better.title')}</h2>
        <p>{i18n.t('cp.better.p')}</p>

        <h3>{i18n.t('cp.b1.title')}</h3>
        <p>{i18n.t('cp.b1.p')}</p>

        <h3>{i18n.t('cp.b2.title')}</h3>
        <p>{i18n.t('cp.b2.p')}</p>

        <h3>{i18n.t('cp.b3.title')}</h3>
        <p>{i18n.t('cp.b3.p')}</p>

        <h3>{i18n.t('cp.b4.title')}</h3>
        <p>{i18n.t('cp.b4.p')}</p>

        <h3>{i18n.t('cp.b5.title')}</h3>
        <p>{i18n.t('cp.b5.a')}<code>store()</code>{i18n.t('cp.b5.b')}<code>component()</code>{i18n.t('cp.b5.c')}<code>server()</code>{i18n.t('cp.b5.d')}</p>

        <div class="note">
          <strong>{i18n.t('lbl.summary')}:</strong> {i18n.t('cp.note')}
        </div>
      </div>
    </main>
  </div>
));
