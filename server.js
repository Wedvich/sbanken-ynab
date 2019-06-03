/* eslint-disable no-console */

require('dotenv').config();

const http2 = require('http2');
const fs = require('fs');
const Koa = require('koa');
const static = require('koa-static');
const helmet = require('koa-helmet');
const compress = require('koa-compress');
const { default: chalk } = require('chalk');

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3000;

const options = {
  cert: fs.readFileSync(process.env.TLS_CERTIFICATE, 'utf8'),
  key: fs.readFileSync(process.env.TLS_CERTIFICATE_KEY, 'utf8'),
};

const app = new Koa()
  .use(helmet({
    contentSecurityPolicy: {
      directives: {
        'default-src': [`'self'`],
      },
    },
    hsts: host !== 'localhost',
    referrerPolicy: {
      policy: 'no-referrer',
    },
  }))
  .use(compress())
  .use(static('public'));

http2.createSecureServer(options, app.callback())
  .listen(port, host,  () => {
    console.log('App is running at %s', chalk.bold.blue(`https://localhost:${port}/`));
    console.log('Content is served from %s', chalk.bold.blue('/public'));
  });
