# astrajs.dev/core

> **Proxy-based, fine-grained reactivity runtime for AstraJS (~3 KB).**

Zero-VDOM: components run **once** and return real DOM. Updates are surgical
mutations of the specific nodes subscribed to a store property — no diffing,
no re-render.

## Features

- **`store()`** — ES6 Proxy-based reactive state with property-level tracking
- **`component()`** — Single-execution component wrapper (returns real DOM)
- **`mounted()`** — DOM lifecycle hook (mount + unmount cleanup)
- **`onCleanup()`** — Register cleanup inside `mounted()` callbacks
- **`swr()`** — Stale-While-Revalidate data helper
- **`classes()`** — Class-name composer
- **DOM bindings** — `bindText`, `bindAttr`, `bindClass`, `bindValue`, `bindList` (auto-injected by the compiler)
- **JSX runtime** — Automatic JSX transform producing real DOM elements

> **Internal primitives — never use in application code:**
> `effect`, `batch`, `untrack`, `dynamic`, `memo` and the `bind*` functions are
> *framework machinery*. The AST compiler injects `dynamic()`/`memo()`/`bind*()`
> where they are needed; developers write plain reactive JSX instead. These
> primitives are intentionally **not typed** in the published package so you
> cannot call them by accident. Use `mounted()` + `onCleanup()` for side effects.

## Usage

```tsx
import { store, component, mounted, onCleanup } from 'astrajs.dev/core';

const Counter = component(() => {
  const counter = store({ count: 0 });

  mounted(() => {
    const id = setInterval(() => counter.count++, 1000);
    onCleanup(() => clearInterval(id)); // runs on unmount
  });

  return (
    <div>
      <span>{counter.count}</span>
      <button onclick={() => counter.count++}>+ 1</button>
    </div>
  );
});
```

The compiler turns `{counter.count}` into an O(1) effect that updates **only
that TextNode**. The component never re-runs.

## JSX

Configure `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "astrajs.dev/core"
  }
}
```

## License

MIT
