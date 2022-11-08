"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const check_1 = __importDefault(require("./controllers/cgi-bin/check"));
const sync_1 = __importDefault(require("./controllers/cgi-bin/sync"));
const clear_1 = __importDefault(require("./controllers/cgi-bin/clear"));
exports.default = (router, options) => {
    router.get('/cgi-bin/check', check_1.default);
    router.post('/cgi-bin/sync', sync_1.default);
    router.post('/cgi-bin/clear', clear_1.default);
};
