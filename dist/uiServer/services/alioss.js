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
exports.pullFromAliOss = exports.pushToAliOss = void 0;
const ali_oss_1 = __importDefault(require("ali-oss"));
const code_1 = require("../constants/code");
function pushToAliOss(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { accessKeyId, accessKeySecret, bucket, region, payloadPairs } = options;
        const client = new ali_oss_1.default({
            accessKeyId,
            accessKeySecret,
            bucket,
            region,
        });
        let code = code_1.CODE_SUCCESS;
        let msg = '';
        let data;
        try {
            yield Promise.all(payloadPairs.map((payloadPair) => {
                const { local, dest } = payloadPair;
                return client.put(dest, local);
            }));
        }
        catch (err) {
            code = code_1.CODE_ERR_UNKNOWN;
            msg = err.message;
        }
        return {
            code,
            msg,
            data,
        };
    });
}
exports.pushToAliOss = pushToAliOss;
function pullFromAliOss(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { accessKeyId, accessKeySecret, bucket, region, payloadPairs } = options;
        const client = new ali_oss_1.default({
            accessKeyId,
            accessKeySecret,
            bucket,
            region,
        });
        let code = code_1.CODE_SUCCESS;
        let msg = '';
        let data;
        try {
            const responseList = yield Promise.all(payloadPairs.map((payloadPair) => {
                const { local, dest } = payloadPair;
                const args = [dest];
                local && args.push(local);
                return client.get.apply(client, args);
            }));
            data = responseList.map((response) => {
                const { res } = response;
                return res.data.toString('utf-8');
            });
        }
        catch (err) {
            code = code_1.CODE_ERR_UNKNOWN;
            msg = err.message;
        }
        return {
            code,
            msg,
            data,
        };
    });
}
exports.pullFromAliOss = pullFromAliOss;
