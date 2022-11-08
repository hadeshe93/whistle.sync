"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const koa_onerror_1 = __importDefault(require("koa-onerror"));
const koa_static_1 = __importDefault(require("koa-static"));
const path_1 = __importDefault(require("path"));
const koa_router_1 = __importDefault(require("koa-router"));
const router_1 = __importDefault(require("./router"));
const MAX_AGE = 1000 * 60 * 5;
exports.default = (server, options) => {
    const app = new koa_1.default();
    app.proxy = true;
    app.silent = true;
    app.context.whistleOptions = options;
    (0, koa_onerror_1.default)(app);
    const router = new koa_router_1.default();
    (0, router_1.default)(router, options);
    app.use((0, koa_bodyparser_1.default)());
    app.use(router.routes());
    app.use(router.allowedMethods());
    app.use((0, koa_static_1.default)(path_1.default.join(__dirname, '../../public'), { maxage: MAX_AGE }));
    server.on('request', app.callback());
};
