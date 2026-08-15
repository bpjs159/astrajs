// Preload: registers the Solid client-build resolver before run.mjs and its
// static imports are resolved. Run with: node --import ./register-solid.mjs run.mjs
import { register } from 'node:module';

register(new URL('./solid-loader.mjs', import.meta.url));
