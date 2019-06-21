/* eslint-disable no-console */

require('dotenv').config();

const http2 = require('http2');
const fs = require('fs');
const Koa = require('koa');
const static = require('koa-static');
const helmet = require('koa-helmet');
const compress = require('koa-compress');
const { default: chalk } = require('chalk');

const { getHttpsOptions } = require('./utils');

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3000;

const app = new Koa()
  .use(helmet({
    contentSecurityPolicy: {
      directives: {
        // eslint-disable-next-line quotes
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

http2.createSecureServer(getHttpsOptions(), app.callback())
  .listen(port, host,  () => {
    console.log('App is running at %s', chalk.bold.blue(`https://localhost:${port}/`));
    console.log('Content is served from %s', chalk.bold.blue('/public'));
  });
