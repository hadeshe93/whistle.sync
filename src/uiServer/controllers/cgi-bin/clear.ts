import { Context, Next } from 'koa';
import { CODE_SUCCESS, CODE_ERR_UNKNOWN } from '../../constants/code';
import { clearAllRules } from '../../services/rules';
import { clearAllValues } from '../../services/values';

export default async (ctx: Context, next: Next) => {
  await next();
  // @ts-ignore
  const { host, uiport: port } = ctx.whistleOptions.config;
  const {
    target,
    pageId: clientId,
  } = ctx.request.body;
  const hostname = `${host}:${port}`;

  let result;
  if (target === 'rules') {
    const data = await clearAllRules({ hostname, clientId });
    result = {
      code: CODE_SUCCESS,
      msg: '',
      data,
    };
  } else if (target === 'values') {
    const data = await clearAllValues({ hostname, clientId });
    result = {
      code: CODE_SUCCESS,
      msg: '',
      data,
    };
  }
  ctx.body = result;
};
