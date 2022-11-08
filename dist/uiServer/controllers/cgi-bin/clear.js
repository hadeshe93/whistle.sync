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
Object.defineProperty(exports, "__esModule", { value: true });
const code_1 = require("../../constants/code");
const rules_1 = require("../../services/rules");
const values_1 = require("../../services/values");
exports.default = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield next();
    const { host, uiport: port } = ctx.whistleOptions.config;
    const { target, pageId: clientId, } = ctx.request.body;
    const hostname = `${host}:${port}`;
    let result;
    if (target === 'rules') {
        const data = yield (0, rules_1.clearAllRules)({ hostname, clientId });
        result = {
            code: code_1.CODE_SUCCESS,
            msg: '',
            data,
        };
    }
    else if (target === 'values') {
        const data = yield (0, values_1.clearAllValues)({ hostname, clientId });
        result = {
            code: code_1.CODE_SUCCESS,
            msg: '',
            data,
        };
    }
    ctx.body = result;
});
