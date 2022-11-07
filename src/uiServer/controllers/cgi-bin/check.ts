import { Context, Next } from 'koa';

export default async (ctx: Context, next: Next) => {
  await next();
  // @ts-ignore
  ctx.body = ctx.whistleOptions;
};
