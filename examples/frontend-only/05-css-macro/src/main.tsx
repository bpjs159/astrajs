import { component, store } from '@astrajs/core';
import { styles as s } from './styles.js';
const themes = ['primary','success','warning','danger'];
const labels: Record<string,string> = { primary:'Primary', success:'Success', warning:'Warning', danger:'Danger' };
const descs: Record<string,string> = { primary:'Indigo gradient', success:'Green gradient', warning:'Amber gradient', danger:'Red gradient' };

export const CSSDemo = component(() => {
  const st = store({ theme: 'primary', clicks: 0 });
  return (
    <div>
      <h1>CSS Macro</h1>
      <p class="subtitle"><code>css\...\</code> extracts styles at build time — zero runtime cost</p>
      <div class="demo-grid">
        <div class={s.box + ' ' + s['box-' + st.theme]} onClick={() => { const i = themes.indexOf(st.theme); st.theme = themes[(i+1)%themes.length]!; st.clicks++; }}>
          <h3>{labels[st.theme]}</h3>
          <p>{descs[st.theme]}</p>
          <p style="margin-top:12px;font-size:.75rem;opacity:.7;">Click to cycle · Clicks: {st.clicks}</p>
        </div>
        <div class="code-block">
          <pre><span class="kw">import</span> {'{'} css {'}'} <span class="kw">from</span> <span class="str">'@astrajs/compiler'</span>;{'\n\n'}<span class="kw">const</span> styles = <span class="fn">css</span><span class="str">\{'\\n'}  .card {'{'} padding: 16px; {'}'}{'\\n'}\</span>;{'\n\n'}<span class="comment">// Compiles to at build time:</span>{'\n'}<span class="kw">const</span> styles = {'{'} card: <span class="str">'card_a3f2c1'</span> {'}'};</pre>
        </div>
      </div>
    </div>
  );
});
