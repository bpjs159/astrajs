# @astrajs/validation

Standalone validator functions for forms and schemas. Zero dependencies, isomorphic (client and server).

## Install

```bash
npm install @astrajs/validation
```

## Usage

```ts
import { isEmail, isRequired, minLength, oneOf, all } from '@astrajs/validation';

isEmail('dev@astrajs.dev');                    // true
minLength(3)('abc');                           // true
oneOf(['a', 'b'])('b');                        // true
all(isRequired, isEmail)('dev@astrajs.dev');   // true
```

## API

Validators: `isEmail`, `isRequired`, `isUrl`, `isNumber`, `isInteger`,
`isAlphanumeric`, `minLength`, `maxLength`, `pattern`, `oneOf`.

Compositors: `all(...validators)` (AND) and `any(...validators)` (OR).

Types: `Validator`, `AsyncValidator`.

## License

MIT
