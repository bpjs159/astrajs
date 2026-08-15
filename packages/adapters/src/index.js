"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitStaticAdapter = exports.emitCloudflareAdapter = exports.emitVercelAdapter = exports.emitNodeAdapter = exports.createVercelHandler = exports.startAstraServer = exports.createNodeHandler = exports.createAstraHandler = void 0;
/**
 * @astrajs/adapters — Public API Entry Point
 *
 * Deployment adapters for AstraJS:
 *
 *   - `createAstraHandler`   platform-neutral core (RPC + optional SSR)
 *   - `createNodeHandler`    Node `(req, res)` handler + static files
 *   - `startAstraServer`     standalone `node:http` server (Fly/Railway/Docker)
 *   - `createVercelHandler`  Vercel serverless function (Node runtime)
 *   - `createCloudflareHandler` (via `@astrajs/adapters/edge`)
 *   - `emit*Adapter`         build-time emitters used by `astra build`
 *
 * Import from `@astrajs/adapters/edge` when bundling for edge runtimes —
 * that entry never pulls in Node.js built-ins.
 */
var core_js_1 = require("./core.js");
Object.defineProperty(exports, "createAstraHandler", { enumerable: true, get: function () { return core_js_1.createAstraHandler; } });
var node_js_1 = require("./node.js");
Object.defineProperty(exports, "createNodeHandler", { enumerable: true, get: function () { return node_js_1.createNodeHandler; } });
Object.defineProperty(exports, "startAstraServer", { enumerable: true, get: function () { return node_js_1.startAstraServer; } });
var vercel_js_1 = require("./vercel.js");
Object.defineProperty(exports, "createVercelHandler", { enumerable: true, get: function () { return vercel_js_1.createVercelHandler; } });
var emit_js_1 = require("./emit.js");
Object.defineProperty(exports, "emitNodeAdapter", { enumerable: true, get: function () { return emit_js_1.emitNodeAdapter; } });
Object.defineProperty(exports, "emitVercelAdapter", { enumerable: true, get: function () { return emit_js_1.emitVercelAdapter; } });
Object.defineProperty(exports, "emitCloudflareAdapter", { enumerable: true, get: function () { return emit_js_1.emitCloudflareAdapter; } });
Object.defineProperty(exports, "emitStaticAdapter", { enumerable: true, get: function () { return emit_js_1.emitStaticAdapter; } });
