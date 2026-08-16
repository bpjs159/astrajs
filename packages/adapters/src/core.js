"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAstraHandler = createAstraHandler;
/**
 * @bpjs159/adapters — platform-neutral request handler
 *
 * `createAstraHandler()` produces a `(request: Request) => Promise<Response>`
 * function that:
 *  1. Routes `/api/astra/:id` (configurable prefix) to `handleRPCRequest()`
 *     from `@bpjs159/server` — the same dispatch the Vite dev middleware uses.
 *  2. Falls back to an optional `render` hook (SSR-on-demand) and finally 404.
 *
 * This module is **edge-safe** (Web APIs only): Node, Vercel and Cloudflare
 * adapters are all thin shells around this core.
 */
var server_1 = require("@bpjs159/server");
/**
 * Creates the platform-neutral Astra request handler (RPC + optional SSR).
 *
 * All adapters (Node, Vercel, Cloudflare) build on this — the platform
 * layer only has to translate between its request/response types and the
 * Web standard `Request`/`Response`.
 */
function createAstraHandler(options) {
    var _this = this;
    var _a;
    if (options === void 0) { options = {}; }
    var apiPrefix = (_a = options.apiPrefix) !== null && _a !== void 0 ? _a : '/api/astra';
    return function (request) { return __awaiter(_this, void 0, void 0, function () {
        var url, id, rendered;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = new URL(request.url);
                    // ── RPC dispatch ────────────────────────────────────────────────────
                    if (url.pathname === apiPrefix || url.pathname.startsWith("".concat(apiPrefix, "/"))) {
                        id = url.pathname
                            .slice(apiPrefix.length + 1)
                            .replace(/\/+$/, '');
                        return [2 /*return*/, (0, server_1.handleRPCRequest)(request, id)];
                    }
                    if (!options.render) return [3 /*break*/, 2];
                    return [4 /*yield*/, options.render(request, url)];
                case 1:
                    rendered = _a.sent();
                    if (rendered)
                        return [2 /*return*/, rendered];
                    _a.label = 2;
                case 2: return [2 /*return*/, new Response(JSON.stringify({ error: 'Not found' }), {
                        status: 404,
                        headers: { 'Content-Type': 'application/json' },
                    })];
            }
        });
    }); };
}
