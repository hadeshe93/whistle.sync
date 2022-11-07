import Router from 'koa-router';


// For help see https://github.com/ZijianHe/koa-router#api-reference
export default (router: Router) => {
  router.get('/cgi-bin/check', (ctx) => {
    ctx.body = 'Hello whistle.';
  });
};
