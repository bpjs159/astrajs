import { component } from '@astrajs/core';
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
  .docs-content a{color:#c4a0ff;text-decoration:underline;text-underline-offset:3px}
  .docs-content code{background:rgba(139,77,255,.1);color:#c4a0ff;padding:2px 7px;border-radius:4px;font-size:.8rem;font-weight:500;font-family:'JetBrains Mono',monospace}
  .docs-content pre{background:#060b14;border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:0;overflow-x:auto;margin-bottom:24px;position:relative}
  .docs-content pre::before{content:'BASH';position:absolute;top:0;right:16px;font-size:.62rem;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.08em;padding:8px 0}
  .docs-content pre code{display:block;background:none;color:#cbd5e1;padding:20px 24px;font-size:.76rem;line-height:1.85;border-radius:0;overflow-x:auto;white-space:pre;tab-size:2}
  .docs-content ul,.docs-content ol{padding-left:24px;margin-bottom:16px}
  .docs-content li{font-size:.88rem;color:#94a3b8;line-height:1.75;margin-bottom:6px}
  .docs-content table{width:100%;border-collapse:collapse;margin-bottom:24px;font-size:.82rem}
  @media(max-width:960px){.docs-content table{display:block;overflow-x:auto;max-width:100%}}
  .docs-content th{text-align:left;padding:10px 14px;background:rgba(255,255,255,.03);color:#e2e8f0;font-weight:700;border-bottom:2px solid rgba(255,255,255,.06)}
  .docs-content td{padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.04);color:#94a3b8}
  .docs-content .note{padding:14px 18px;background:rgba(139,77,255,.06);border-left:3px solid rgba(139,77,255,.3);border-radius:0 8px 8px 0;margin-bottom:20px;font-size:.84rem;color:#c4a0ff}
`;

export const DocsAi = component(() => (
  <div class="docs-layout">
    <style>{s}</style>
    <DocSidebar />
    <main class="docs-main">
      <div class="docs-content">
        <h1>{i18n.t('sb.ai')}</h1>
        <p>{i18n.t('ai.hero.a')}<strong>{i18n.t('ai.hero.b')}</strong></p>

        <h2 id="endpoints">{i18n.t('sb.aiEndpoints')}</h2>
        <p>{i18n.t('ai.why.p1')}<code>ai()</code>{i18n.t('ai.why.p2')}</p>
        <p><code>ai()</code>{i18n.t('ai.endpoints.p1')}<code>aiStream()</code>{i18n.t('ai.endpoints.p2')}</p>
        <p>{i18n.t('ai.endpoints.p3')}</p>
        <CodeBlock code={`// src/ai.ts — runs on the server (keys never ship)
import { ai, aiStream } from '@astrajs/ai';

export const summarize = ai(
  { model: 'qwen2.5-coder:7b', maxAge: 300, tags: ['summaries'] },
  async (text: string) => \`Summarize this in one sentence: \${text}\`
);

export const chat = aiStream(
  { model: 'qwen2.5-coder:7b' },
  async (question: string) => \`Answer briefly: \${question}\`
);

// src/app.tsx — client: typed calls
const result = await summarize(longText);        // { text: string }
chat('hello', (chunk) => { answer += chunk; });  // tokens arrive live`} commentsKey="ai.endpoints" />

        <h2 id="streaming">{i18n.t('sb.aiStreaming')}</h2>
        <p>{i18n.t('ai.stream.p')}</p>
        <p>{i18n.t('ai.stream.p2')}</p>
        <CodeBlock code={`const state = store({ answer: '', status: 'idle' });

chat(question, (chunk) => {
  state.answer += chunk;   // one TextNode mutation per token
});`} commentsKey="ai.streaming" />

        <h2 id="build-time">{i18n.t('sb.aiBuildTime')}</h2>
        <p><code>ai({'{ type: \'pre-build\' }'})</code>{i18n.t('ai.build.p')}</p>
        <p>{i18n.t('ai.build.p2')}</p>
        <CodeBlock code={`export const faq = ai({ type: 'pre-build', model: 'qwen2.5-coder:7b' }, async () => {
  return 'Generate 3 FAQs about AstraJS. Respond ONLY as a JSON array of {"q": "...", "a": "..."} objects.';
});

// The client receives: const faq = [{"q":"...","a":"..."}];`} commentsKey="ai.build" />

        <h2 id="caching">{i18n.t('sb.aiCaching')}</h2>
        <p>{i18n.t('ai.cache.p')}</p>
        <ul>
          <li>{i18n.t('ai.cache.b1')}</li>
          <li>{i18n.t('ai.cache.b2')}</li>
          <li>{i18n.t('ai.cache.b3')}</li>
        </ul>

        <h2 id="tools">{i18n.t('sb.aiTools')}</h2>
        <p>{i18n.t('ai.tools.p1')}<code>aiAgent()</code>{i18n.t('ai.tools.p2')}</p>
        <p>{i18n.t('ai.tools.p3')}</p>
        <CodeBlock code={`import { server } from '@astrajs/server';
import { aiAgent } from '@astrajs/ai';

export const getProduct = server(async (id: string) => db.products.find(id));

const shop = aiAgent({
  system: 'You are a shop assistant.',
  model: 'qwen2.5-coder:7b',
  tools: [
    {
      schema: {
        name: 'getProduct',
        description: 'Get a product by id.',
        parameters: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
      },
      fn: async (id: unknown) => getProduct(String(id)),
    },
  ],
});

export const askShop = server(async (question: string) => shop.run(question));`} />

        <h2 id="rag">{i18n.t('sb.aiRag')}</h2>
        <p><code>@astrajs/ai/rag</code>{i18n.t('ai.rag.p')}</p>
        <CodeBlock code={`import { createRag } from '@astrajs/ai/rag';

const rag = createRag();
await rag.index('docs', [...chunks]);

export const askDocs = server(async (q: string) => rag.answer('docs', q));`} />

        <h2 id="cli">{i18n.t('sb.aiCli')}</h2>
        <p>{i18n.t('ai.cli.p')}</p>
        <CodeBlock code={`astra ai chat "explain direct DOM mutations"
astra ai translate fr src/i18n-en.json`} />

        <h2 id="config">{i18n.t('sb.aiConfig')}</h2>
        <p>{i18n.t('ai.env.p')}</p>
        <table>
          <tr><th>Variable</th><th>Description</th></tr>
          <tr><td><code>ASTRA_AI_PROVIDER</code></td><td>{i18n.t('ai.env.provider')}</td></tr>
          <tr><td><code>ASTRA_AI_BASE_URL</code></td><td>{i18n.t('ai.env.base')}</td></tr>
          <tr><td><code>ASTRA_AI_API_KEY</code></td><td>{i18n.t('ai.env.key')}</td></tr>
          <tr><td><code>ASTRA_AI_MODEL</code></td><td>{i18n.t('ai.env.model')}</td></tr>
          <tr><td><code>ASTRA_AI_EMBED_MODEL</code></td><td>{i18n.t('ai.env.embed')}</td></tr>
        </table>

        <div class="note">
          <strong>Zero-config dev:</strong> <code>ASTRA_AI_PROVIDER=ollama</code> targets a local
          Ollama with no API key. <code>mock</code> runs offline with deterministic output.
        </div>

        <h2>{i18n.t('sb.examples')}</h2>
        <p>{i18n.t('ai.next.a')}<a href="/docs/examples#fullstack">{i18n.t('ai.next.c')}</a>{i18n.t('ai.next.b')}<a href="/docs/deployment">{i18n.t('sb.deploy')}</a>{i18n.t('ai.next.d')}</p>
      </div>
    </main>
    <DocRightToc items={[
      { href: '/docs/ai#endpoints', k: 'sb.aiEndpoints' },
      { href: '/docs/ai#streaming', k: 'sb.aiStreaming' },
      { href: '/docs/ai#build-time', k: 'sb.aiBuildTime' },
      { href: '/docs/ai#caching', k: 'sb.aiCaching' },
      { href: '/docs/ai#tools', k: 'sb.aiTools' },
      { href: '/docs/ai#rag', k: 'sb.aiRag' },
      { href: '/docs/ai#cli', k: 'sb.aiCli' },
      { href: '/docs/ai#config', k: 'sb.aiConfig' },
    ]} />
  </div>
));
