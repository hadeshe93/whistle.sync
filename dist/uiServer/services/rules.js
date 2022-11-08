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
exports.importAllRules = exports.exportAllRules = exports.clearAllRules = exports.removeRule = exports.fetchRulesList = void 0;
const form_data_1 = __importDefault(require("form-data"));
const request_1 = require("../utils/request");
const fetchRulesList = (options) => __awaiter(void 0, void 0, void 0, function* () { return (0, request_1.request)(`http://${options.hostname}/cgi-bin/rules/list`); });
exports.fetchRulesList = fetchRulesList;
const removeRule = (options, config) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, request_1.request)(Object.assign({ url: `http://${options.hostname}/cgi-bin/rules/remove`, method: 'POST', headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        } }, config));
});
exports.removeRule = removeRule;
const clearAllRules = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const { clientId } = options;
    const rulesRes = yield (0, exports.fetchRulesList)(options);
    const { list: rules } = rulesRes;
    return yield Promise.all(rules.map(rule => {
        const data = {
            clientId,
            name: rule.name,
        };
        return (0, exports.removeRule)(options, {
            data,
        });
    }));
});
exports.clearAllRules = clearAllRules;
const exportAllRules = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const rulesRes = yield (0, exports.fetchRulesList)(options);
    const { list: rules, defaultRules } = rulesRes;
    const result = {};
    rules.forEach((rule) => {
        result[rule.name] = rule.data;
    });
    result['Default'] = defaultRules;
    return result;
});
exports.exportAllRules = exportAllRules;
const importAllRules = (options, configs) => __awaiter(void 0, void 0, void 0, function* () {
    const { hostname, clientId } = options;
    return new Promise((resolve, reject) => {
        const formData = new form_data_1.default();
        const { data } = configs;
        Object.keys(data).forEach((key) => {
            const value = JSON.stringify(data[key]);
            formData.append(key, value);
        });
        const [host, port = 80] = hostname.split(':');
        formData.submit({
            host,
            port,
            path: `/cgi-bin/rules/import?clientId=${clientId || ''}`,
        }, function (err, res) {
            if (err) {
                reject(err);
            }
            else {
                let buf = [];
                res.on('data', (chunks) => {
                    buf = buf.concat(chunks);
                });
                res.on('end', () => {
                    let result = buf.toString();
                    try {
                        result = JSON.parse(result);
                    }
                    catch (err) {
                    }
                    finally {
                        resolve(result);
                    }
                });
            }
        });
    });
});
exports.importAllRules = importAllRules;
