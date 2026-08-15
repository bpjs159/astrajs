"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCloudflareHandler = exports.createAstraHandler = void 0;
/**
 * @astrajs/adapters/edge — edge-safe public API (Cloudflare Workers)
 *
 * Importing from this entry guarantees the module graph contains NO
 * Node.js built-ins — safe to bundle for edge runtimes.
 */
var core_js_1 = require("./core.js");
Object.defineProperty(exports, "createAstraHandler", { enumerable: true, get: function () { return core_js_1.createAstraHandler; } });
var cloudflare_js_1 = require("./cloudflare.js");
Object.defineProperty(exports, "createCloudflareHandler", { enumerable: true, get: function () { return cloudflare_js_1.createCloudflareHandler; } });
