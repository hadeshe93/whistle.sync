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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const code_1 = require("../../constants/code");
const rules_1 = require("../../services/rules");
const values_1 = require("../../services/values");
const alioss_1 = require("../../services/alioss");
exports.default = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield next();
    const { host, uiport: port } = ctx.whistleOptions.config;
    const { op, pageId: clientId, accessKeyId, accessKeySecret, bucket, region, destPath, } = ctx.request.body;
    const hostname = `${host}:${port}`;
    let result;
    if (op === 'push') {
        const allRules = yield (0, rules_1.exportAllRules)({ hostname });
        const allValues = yield (0, values_1.exportAllValues)({ hostname });
        result = yield (0, alioss_1.pushToAliOss)({
            accessKeyId,
            accessKeySecret,
            bucket,
            region,
            payloadPairs: [{
                    local: Buffer.from(JSON.stringify(allRules)),
                    dest: path_1.default.resolve(destPath, 'rules.json'),
                }, {
                    local: Buffer.from(JSON.stringify(allValues)),
                    dest: path_1.default.resolve(destPath, 'values.json'),
                }],
        });
    }
    else if (op === 'pull') {
        const pullResult = yield (0, alioss_1.pullFromAliOss)({
            accessKeyId,
            accessKeySecret,
            bucket,
            region,
            payloadPairs: [{
                    local: null,
                    dest: path_1.default.resolve(destPath, 'rules.json'),
                }, {
                    local: null,
                    dest: path_1.default.resolve(destPath, 'values.json'),
                }],
        });
        const [rulesStr, valuesStr] = pullResult.data;
        const rulesJSON = JSON.parse(rulesStr);
        const valuesJSON = JSON.parse(valuesStr);
        try {
            const importRulesResult = yield (0, rules_1.importAllRules)({
                hostname,
                clientId,
            }, {
                data: {
                    rules: rulesJSON,
                    replaceAll: 1,
                },
            });
            const importValuesResult = yield (0, values_1.importAllValues)({
                hostname,
                clientId,
            }, {
                data: {
                    rules: valuesJSON,
                    replaceAll: 1,
                },
            });
            const isSuccess = importRulesResult.ec === 0 && importValuesResult.ec === 0;
            const code = isSuccess ? code_1.CODE_SUCCESS : code_1.CODE_ERR_UNKNOWN;
            const msg = isSuccess ? '' : '同步失败';
            result = {
                code,
                msg,
                data: isSuccess ? null : [importRulesResult, importValuesResult],
            };
        }
        catch (err) {
            result = {
                code: code_1.CODE_ERR_UNKNOWN,
                msg: err.message,
                data: null,
            };
        }
    }
    ctx.body = result;
});
