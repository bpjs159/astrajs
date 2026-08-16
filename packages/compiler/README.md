# @bpjs159/compiler

> **AST-based Vite plugin: JSX → Vanilla DOM, CSS extraction, server compilation.**

## Features

- **JSX → DOM** — Transforms JSX into `document.createElement` + reactive bindings
- **CSS Extraction** — `css` tagged templates → static `.css` files with hashed class names
- **server Compilation** — Creates API endpoints, replaces client calls with typed fetch
- **Constant Folding** — `type: 'pre-build'` functions execute at build time, result inlined
- **Zero Runtime** — All macros (`css`, `server`) are compile-time only

## Usage

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import astra from '@bpjs159/core/vite';

export default defineConfig({
  plugins: [
    astra({
      cssPrefix: 'my-',
      cssHashLength: 8,
      apiPrefix: '/api/rpc'
    })
  ]
});
```

## How it works

### Phase 1: JSX → Vanilla DOM

```tsx
// Input
<span class="counter">{state.count}</span>

// Output (simplified)
const el = document.createElement('span');
el.className = 'counter';
const tn = document.createTextNode('');
bindText(tn, () => String(state.count));
el.appendChild(tn);
```

### Phase 2: CSS Extraction

The `css` macro is extracted at build time and replaced with a hash map:

```ts
// Input
const styles = css`.card { color: red; }`

// Output
// → astra-card-a1b2c3.css (static file)
// styles = { card: 'card_a1b2c3' }
```

### Phase 3: server Compilation

```ts
// Input
const getData = server(async (id: string) => db.find(id));

// Output (client)
const getData = async (id) => fetch('/api/astra/getData', {
  method: 'POST',
  body: JSON.stringify([id])
}).then(r => r.json());

// Output (server — API route created)
app.post('/api/astra/getData', async (req, res) => {
  const [id] = req.body;
  const result = await db.find(id);
  res.json(result);
});
```

## License

MIT
