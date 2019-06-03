/* eslint-disable no-console */

require('dotenv').config();

const Koa = require('koa');
const static = require('koa-static');
const { default: chalk } = require('chalk');

const port = process.env.PORT || 3000;

new Koa()
  .use(static('public'))
  .listen(port, () => {
    console.log('App is running at %s', chalk.bold.blue(`http://localhost:${port}/`));
    console.log('Content is served from %s', chalk.bold.blue('/public'));
  });
