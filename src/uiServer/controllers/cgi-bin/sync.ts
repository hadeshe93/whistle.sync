import path from 'path';
import { Context, Next } from 'koa';
import { CODE_SUCCESS, CODE_ERR_UNKNOWN } from '../../constants/code';
import { fetchInit } from '../../services/base';
import { exportAllRules, importAllRules } from '../../services/rules';
import { pushToAliOss, pullFromAliOss } from '../../services/alioss';

export default async (ctx: Context, next: Next) => {
  await next();
  // @ts-ignore
  const { host, uiport: port } = ctx.whistleOptions.config;
  const {
    op,
    accessKeyId,
    accessKeySecret,
    bucket,
    region,
    destPath,
  } = ctx.request.body;
  const hostname = `${host}:${port}`;

  let result;
  if (op === 'push') {
    const allRules = await exportAllRules(hostname);
    result = await pushToAliOss({
      accessKeyId,
      accessKeySecret,
      bucket,
      region,
      payloadPairs: [{
        local: Buffer.from(JSON.stringify(allRules)),
        dest: path.resolve(destPath, 'rules.json'),
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
      }],
    });
    const rulesStr = pullResult.data?.[0];
    const rulesJSON = JSON.parse(rulesStr);
    try {
      const { clientId = '' } = await fetchInit(hostname);
      const importResult = await importAllRules(hostname, {
        params: {
          clientId,
        },
        data: {
          rules: rulesJSON,
          replaceAll: 1,
        },
      });
      result = {
        code: CODE_SUCCESS,
        msg: '',
        data: importResult,
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
