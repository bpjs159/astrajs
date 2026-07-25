# @astrajs/ssr

> **Server-Side Rendering, Static Site Generation, and Incremental Static Regeneration for AstraJS.**

## Features

- **Resumable SSR** — Serializes state into `astra-data`, zero eager hydration
- **SSG Crawler** — Generates static `.html` files from your route tree
- **ISR** — Incremental Static Regeneration with cache tags and `maxAge`
- **`renderToString`** — Render any component tree to HTML on the server
- **State Serialization** — `serializeState` / `deserializeState` for `astra-data`
- **Constant Folding** — Pre-build `server$` calls are executed at SSG time

## Usage

### SSR (Node.js server)

```ts
import { renderToString } from '@astrajs/ssr';
import App from './App';

async function handleRequest(req: Request): Promise<Response> {
  const html = await renderToString({
    root: () => <App />,
    template: (appHtml) => `<!DOCTYPE html>
      <html>
        <head><title>AstraJS App</title></head>
        <body><div id="root">${appHtml}</div></body>
      </html>`,
  });
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
```

### SSG (Static Site Generation)

```ts
import { generateStaticSite } from '@astrajs/ssr';
import { appRoutes } from './routes';
import App from './App';

await generateStaticSite({
  root: () => <App />,
  routes: appRoutes,
  outDir: 'dist',
  siteUrl: 'https://mysite.com',
  extraPaths: ['/blog/post-1', '/blog/post-2'],
});
```

### State Serialization (Resumability)

```ts
import { store } from '@astrajs/core';
import { serializeState, deserializeState } from '@astrajs/ssr';

// Server: serialize state into HTML
const state = store({ count: 0, user: { name: 'Alice' } });
const serialized = serializeState(state);
// → '<div astra-data="{&quot;count&quot;:0,&quot;user&quot;:{&quot;name&quot;:&quot;Alice&quot;}}">'

// Client: deserialize from HTML attribute
const el = document.querySelector('[astra-data]');
const raw = el.getAttribute('astra-data');
const hydrated = deserializeState(raw); // Returns reactive proxy
```

## License

MIT
