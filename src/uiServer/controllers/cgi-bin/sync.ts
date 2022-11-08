import path from 'path';
import { Context, Next } from 'koa';
import { CODE_SUCCESS, CODE_ERR_UNKNOWN } from '../../constants/code';
import { exportAllRules, importAllRules } from '../../services/rules';
import { exportAllValues, importAllValues } from '../../services/values';
import { pushToAliOss, pullFromAliOss } from '../../services/alioss';

export default async (ctx: Context, next: Next) => {
  await next();
  // @ts-ignore
  const { host, uiport: port } = ctx.whistleOptions.config;
  const {
    op,
    pageId: clientId,
    accessKeyId,
    accessKeySecret,
    bucket,
    region,
    destPath,
  } = ctx.request.body;
  const hostname = `${host}:${port}`;

  let result;
  if (op === 'push') {
    const allRules = await exportAllRules({ hostname });
    const allValues = await exportAllValues({ hostname });
    result = await pushToAliOss({
      accessKeyId,
      accessKeySecret,
      bucket,
      region,
      payloadPairs: [{
        local: Buffer.from(JSON.stringify(allRules)),
        dest: path.resolve(destPath, 'rules.json'),
      }, {
        local: Buffer.from(JSON.stringify(allValues)),
        dest: path.resolve(destPath, 'values.json'),
      }],
    });
  } else if (op === 'pull') {
    const pullResult = await pullFromAliOss({
      accessKeyId,
      accessKeySecret,
      bucket,
      region,
      payloadPairs: [{
        local: null,
        dest: path.resolve(destPath, 'rules.json'),
      }, {
        local: null,
        dest: path.resolve(destPath, 'values.json'),
      }],
    });
    const [rulesStr, valuesStr] = pullResult.data;
    const rulesJSON = JSON.parse(rulesStr);
    const valuesJSON = JSON.parse(valuesStr);
    try {
      const importRulesResult = await importAllRules({
        hostname,
        clientId,
      }, {
        data: {
          rules: rulesJSON,
          replaceAll: 1,
        },
      });
      const importValuesResult = await importAllValues({
        hostname,
        clientId,
      }, {
        data: {
          rules: valuesJSON,
          replaceAll: 1,
        },
      });
      const isSuccess = importRulesResult.ec === 0 && importValuesResult.ec === 0;
      const code = isSuccess ? CODE_SUCCESS : CODE_ERR_UNKNOWN;
      const msg = isSuccess ? '' : '同步失败';
      result = {
        code,
        msg,
        data: isSuccess ? null : [importRulesResult, importValuesResult],
      };
    } catch (err) {
      result = {
        code: CODE_ERR_UNKNOWN,
        msg: err.message,
        data: null,
      };
    }
  }
  ctx.body = result;
};
