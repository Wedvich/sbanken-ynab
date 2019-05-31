const Koa = require('koa');
const static = require('koa-static');

const app = new Koa()
  .use(static('public'));

// if (process.env.NODE_ENV === 'development') {
//   const koaWebpack = require('koa-webpack');
//   const middleware = await koaWebpack({});
//   app.use(middleware);
// }

app.listen(3000);
console.log('Listening on port 3000');
