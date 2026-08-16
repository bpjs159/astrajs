# @bpjs159/form

Reactive metadata controller for AstraJS forms. Delegates validation to the
HTML5 Constraint Validation API — no extra validators to configure.

## Install

```bash
npm install @bpjs159/form
```

## Usage

```ts
import { form } from '@bpjs159/form';

const login = form({ email: '', password: '' });

// Reactive (Proxy-backed) controller:
login.values.email;  // current value
login.validity;      // { email: true, password: false, ... }
login.errors;        // resolved error messages
login.touched;       // { email: false, password: true, ... }

login.submit(async (values) => {
  // only runs when the form is valid
});
```

## API

- `form(initialValues)` → `FormController`
- `getFormErrors(validity)` / `getErrorCode(...)` helpers
- Types: `FormController`, `ErrorCode`

## License

MIT
