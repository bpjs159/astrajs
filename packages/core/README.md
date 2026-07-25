# @astrajs/core

> **Proxy-based fine-grained reactivity runtime for AstraJS.**

## Features

- **`store()`** — ES6 Proxy-based reactive state with property-level tracking (~3KB)
- **`effect()`** — Auto-tracking side effects
- **`memo()`** — Lazy derived signals
- **`batch()`** — Atomic multi-mutation batching
- **`untrack()`** — Escape hatches for non-reactive reads
- **DOM bindings** — `bindText`, `bindAttr`, `bindClass`, `bindValue`, `bindList`
- **JSX runtime** — Automatic JSX transform producing real DOM elements

## Usage

```ts
import { store, effect, memo, batch, Component } from '@astrajs/core';

// Create reactive state
const counter = store({ count: 0 });

// Auto-tracking effect
effect(() => {
  console.log(`Count: ${counter.count}`);
  // Logs "Count: 0" immediately, then "Count: 1" on mutation
});

counter.count++; // Triggers only the subscribers of `count`

// Derived values
const doubled = memo(() => counter.count * 2);
console.log(doubled()); // 2

// Batch mutations
batch(() => {
  counter.count = 10;
  counter.count = 20;
}); // Only one notification cycle
```

## JSX

Configure `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@astrajs/core"
  }
}
```

Then components return real DOM:

```tsx
const Greeting: Component<{ name: string }> = ({ name }) => (
  <h1>Hello, {name}!</h1>
);
```

## License

MIT
