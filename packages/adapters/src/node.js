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
exports.createNodeHandler = createNodeHandler;
exports.startAstraServer = startAstraServer;
/**
 * astrajs.dev/adapters — Node adapter (long-running server)
 *
 * One `node:http` server that handles:
 *   - RPC (`/api/astra/:id`) via the platform-neutral core
 *   - static files from the client build (`dist/`)
 *   - optional SSR hook
 *
 * Targets Fly.io, Railway, Render, EC2, bare metal and Docker.
 */
var node_http_1 = require("node:http");
var node_fs_1 = require("node:fs");
var node_path_1 = require("node:path");
var core_js_1 = require("./core.js");
var node_bridge_js_1 = require("./node-bridge.js");
var MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript',
    '.mjs': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.map': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.txt': 'text/plain; charset=utf-8',
};
/**
 * Serves a static file if it exists inside `staticDir`.
 * Returns `null` when the path does not resolve to a real file (or escapes the dir).
 */
function serveStatic(staticDir, pathname) {
    var _a;
    var rel = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    if (rel.includes('..') || rel.includes('\0'))
        return null;
    var abs = (0, node_path_1.normalize)((0, node_path_1.join)(staticDir, rel));
    if (abs !== staticDir && !abs.startsWith(staticDir + '/')) {
        return null;
    }
    try {
        if (!(0, node_fs_1.existsSync)(abs) || !(0, node_fs_1.statSync)(abs).isFile())
            return null;
    }
    catch (_b) {
        return null;
    }
    var type = (_a = MIME_TYPES[(0, node_path_1.extname)(abs).toLowerCase()]) !== null && _a !== void 0 ? _a : 'application/octet-stream';
    var headers = { 'Content-Type': type };
    // Long-lived immutable cache for hashed assets, short for HTML.
    headers['Cache-Control'] = rel.startsWith('assets/')
        ? 'public, max-age=31536000, immutable'
        : 'public, max-age=0, must-revalidate';
    return new Response(new Uint8Array((0, node_fs_1.readFileSync)(abs)), { status: 200, headers: headers });
}
/**
 * Creates a Node `(req, res)` handler wrapping the platform-neutral core
 * plus static file serving. Suitable for Express/Fastify `app.use()`-style
 * mounting via `http.createServer(handler)`.
 */
function createNodeHandler(options) {
    var _this = this;
    var _a;
    if (options === void 0) { options = {}; }
    var handle = (0, core_js_1.createAstraHandler)({
        apiPrefix: options.apiPrefix,
        render: (_a = options.render) !== null && _a !== void 0 ? _a : (options.staticDir
            ? function (_request, url) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/, serveStatic(options.staticDir, url.pathname)];
            }); }); }
            : undefined),
    });
    return function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var webRequest, response, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, (0, node_bridge_js_1.toWebRequest)(req)];
                case 1:
                    webRequest = _a.sent();
                    return [4 /*yield*/, handle(webRequest)];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, (0, node_bridge_js_1.writeResponse)(res, response)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    (0, node_bridge_js_1.writeError)(res, err_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
}
/**
 * Starts the standalone Astra server (RPC + static + optional SSR).
 *
 * Typical generated entry:
 * ```ts
 * import { startAstraServer } from 'astrajs.dev/adapters';
 * startAstraServer({ apiPrefix: '/api/astra', staticDir: '...' });
 * ```
 */
function startAstraServer(options) {
    var _a, _b, _c;
    var port = (_a = options.port) !== null && _a !== void 0 ? _a : Number((_b = process.env.PORT) !== null && _b !== void 0 ? _b : 3000);
    var host = (_c = options.host) !== null && _c !== void 0 ? _c : '0.0.0.0';
    var handler = createNodeHandler(options);
    var server = (0, node_http_1.createServer)(function (req, res) {
        void handler(req, res);
    });
    server.listen(port, host, function () {
        var _a;
        console.log("[AstraJS] server listening on http://".concat(host, ":").concat(port));
        console.log("[AstraJS] RPC prefix: ".concat((_a = options.apiPrefix) !== null && _a !== void 0 ? _a : '/api/astra').concat(options.staticDir ? " \u00B7 static: ".concat((0, node_path_1.resolve)(options.staticDir)) : ''));
    });
    return server;
}
