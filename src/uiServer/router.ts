import Router from 'koa-router';
import check from './controllers/cgi-bin/check';
import sync from './controllers/cgi-bin/sync';


// For help see https://github.com/ZijianHe/koa-router#api-reference
export default (router: Router, options: Whistle.PluginOptions) => {
  router.get('/cgi-bin/check', check);
  router.post('/cgi-bin/sync', sync);
};
