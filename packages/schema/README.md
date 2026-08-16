# @astrajs/schema

Declarative, type-safe validation schemas for AstraJS. Types are inferred
from the schema — no codegen.

## Install

```bash
npm install @astrajs/schema
```

## Usage

```ts
import { schema } from '@astrajs/schema';

const User = schema.object({
  name: schema.string().min(2),
  email: schema.string().email(),
  age: schema.number().min(0).optional(),
});

type User = typeof User._type; // { name: string; email: string; age?: number }
```

## API

- `schema.string()` / `schema.number()` / `schema.object({...})`
- Chainable rules (`.min()`, `.email()`, `.optional()`, …)
- `ValidationResult` and `Infer` exported for advanced use

## License

MIT
