import path from 'path';
import { Context, Next } from 'koa';
import { fetchAllRules } from '../../services/rules';
import { pushRulesToAliOss } from '../../services/alioss';

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

  let result;
  if (op === 'push') {
    const allRulesRes = await fetchAllRules(`${host}:${port}`);
    result = await pushRulesToAliOss({
      accessKeyId,
      accessKeySecret,
      bucket,
      region,
      payloadPairs: [{
        local: Buffer.from(JSON.stringify(allRulesRes)),
        dest: path.resolve(destPath, 'rules.json'),
      }],
    })
  }


  ctx.body = result;
};
