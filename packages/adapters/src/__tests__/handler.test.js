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
var vitest_1 = require("vitest");
var server_1 = require("@bpjs159/server");
var core_js_1 = require("../core.js");
var cloudflare_js_1 = require("../cloudflare.js");
var PREFIX = '/api/astra';
(0, vitest_1.describe)('createAstraHandler (platform-neutral core)', function () {
    (0, vitest_1.it)('dispatches a POST RPC call by handler id', function () { return __awaiter(void 0, void 0, void 0, function () {
        var handle, res, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    (0, server_1.rpcHandler)('testAdd', function (a, b) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, a + b];
                    }); }); });
                    handle = (0, core_js_1.createAstraHandler)();
                    return [4 /*yield*/, handle(new Request("http://localhost".concat(PREFIX, "/testAdd"), {
                            method: 'POST',
                            body: JSON.stringify([2, 3]),
                        }))];
                case 1:
                    res = _b.sent();
                    (0, vitest_1.expect)(res.status).toBe(200);
                    _a = vitest_1.expect;
                    return [4 /*yield*/, res.json()];
                case 2:
                    _a.apply(void 0, [_b.sent()]).toBe(5);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('returns 404 with the error contract for unknown handlers', function () { return __awaiter(void 0, void 0, void 0, function () {
        var handle, res, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    handle = (0, core_js_1.createAstraHandler)();
                    return [4 /*yield*/, handle(new Request("http://localhost".concat(PREFIX, "/nope"), { method: 'POST', body: '[]' }))];
                case 1:
                    res = _b.sent();
                    (0, vitest_1.expect)(res.status).toBe(404);
                    _a = vitest_1.expect;
                    return [4 /*yield*/, res.json()];
                case 2:
                    _a.apply(void 0, [(_b.sent())]).error;
                    return [2 /*return*/];
            }
        });
    }); }).toContain('nope');
});
(0, vitest_1.it)('returns 500 with the server error message when the handler throws', function () { return __awaiter(void 0, void 0, void 0, function () {
    var handle, res, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                (0, server_1.rpcHandler)('testBoom', function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        throw new Error('DB down');
                    });
                }); });
                handle = (0, core_js_1.createAstraHandler)();
                return [4 /*yield*/, handle(new Request("http://localhost".concat(PREFIX, "/testBoom"), { method: 'POST', body: '[]' }))];
            case 1:
                res = _b.sent();
                (0, vitest_1.expect)(res.status).toBe(500);
                _a = vitest_1.expect;
                return [4 /*yield*/, res.json()];
            case 2:
                _a.apply(void 0, [(_b.sent())]).error;
                return [2 /*return*/];
        }
    });
}); }).toBe('DB down');
;
(0, vitest_1.it)('respects a custom apiPrefix', function () { return __awaiter(void 0, void 0, void 0, function () {
    var handle, res, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                (0, server_1.rpcHandler)('testCustom', function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                    return [2 /*return*/, 42];
                }); }); });
                handle = (0, core_js_1.createAstraHandler)({ apiPrefix: '/rpc' });
                return [4 /*yield*/, handle(new Request('http://localhost/rpc/testCustom', { method: 'POST', body: '[]' }))];
            case 1:
                res = _b.sent();
                _a = vitest_1.expect;
                return [4 /*yield*/, res.json()];
            case 2:
                _a.apply(void 0, [_b.sent()]).toBe(42);
                return [2 /*return*/];
        }
    });
}); });
(0, vitest_1.it)('sets ISR cache headers when the handler declares maxAge/tags', function () { return __awaiter(void 0, void 0, void 0, function () {
    var handle, res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                (0, server_1.rpcHandler)('testCached', function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                    return [2 /*return*/, ({ ok: true })];
                }); }); }, { maxAge: 60, tags: ['products'] });
                handle = (0, core_js_1.createAstraHandler)();
                return [4 /*yield*/, handle(new Request("http://localhost".concat(PREFIX, "/testCached"), { method: 'POST', body: '[]' }))];
            case 1:
                res = _a.sent();
                (0, vitest_1.expect)(res.headers.get('Cache-Control')).toContain('max-age=60');
                (0, vitest_1.expect)(res.headers.get('Cache-Tag')).toBe('products');
                return [2 /*return*/];
        }
    });
}); });
(0, vitest_1.it)('sets ETag and answers 304 when autoSync matches', function () { return __awaiter(void 0, void 0, void 0, function () {
    var handle, first, etag, second;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                (0, server_1.rpcHandler)('testSync', function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                    return [2 /*return*/, ({ v: 1 })];
                }); }); }, { autoSync: true });
                handle = (0, core_js_1.createAstraHandler)();
                return [4 /*yield*/, handle(new Request("http://localhost".concat(PREFIX, "/testSync"), { method: 'POST', body: '[]' }))];
            case 1:
                first = _a.sent();
                etag = first.headers.get('ETag');
                (0, vitest_1.expect)(etag).toBeTruthy();
                return [4 /*yield*/, handle(new Request("http://localhost".concat(PREFIX, "/testSync"), {
                        method: 'POST',
                        body: '[]',
                        headers: { 'If-None-Match': etag !== null && etag !== void 0 ? etag : '' },
                    }))];
            case 2:
                second = _a.sent();
                (0, vitest_1.expect)(second.status).toBe(304);
                return [2 /*return*/];
        }
    });
}); });
(0, vitest_1.it)('falls through to the render hook for non-API paths', function () { return __awaiter(void 0, void 0, void 0, function () {
    var handle, hit, _a, miss;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                handle = (0, core_js_1.createAstraHandler)({
                    render: function (_req, url) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, url.pathname === '/hello' ? new Response('hi') : null];
                    }); }); },
                });
                return [4 /*yield*/, handle(new Request('http://localhost/hello'))];
            case 1:
                hit = _b.sent();
                _a = vitest_1.expect;
                return [4 /*yield*/, hit.text()];
            case 2:
                _a.apply(void 0, [_b.sent()]).toBe('hi');
                return [4 /*yield*/, handle(new Request('http://localhost/other'))];
            case 3:
                miss = _b.sent();
                (0, vitest_1.expect)(miss.status).toBe(404);
                return [2 /*return*/];
        }
    });
}); });
;
(0, vitest_1.describe)('createCloudflareHandler (edge)', function () {
    (0, vitest_1.it)('returns a fetch() entry compatible with Workers', function () { return __awaiter(void 0, void 0, void 0, function () {
        var worker, res, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    (0, server_1.rpcHandler)('testEdge', function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, 'edge-ok'];
                    }); }); });
                    worker = (0, cloudflare_js_1.createCloudflareHandler)();
                    (0, vitest_1.expect)(typeof worker.fetch).toBe('function');
                    return [4 /*yield*/, worker.fetch(new Request("http://localhost".concat(PREFIX, "/testEdge"), { method: 'POST', body: '[]' }))];
                case 1:
                    res = _b.sent();
                    _a = vitest_1.expect;
                    return [4 /*yield*/, res.json()];
                case 2:
                    _a.apply(void 0, [_b.sent()]).toBe('edge-ok');
                    return [2 /*return*/];
            }
        });
    }); });
});
