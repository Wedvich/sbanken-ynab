require('dotenv').config();

const Koa = require('koa');
const static = require('koa-static');
const { default: chalk } = require('chalk');

const port = process.env.PORT || 3000;

new Koa()
  .use(static('public'))
  .listen(port, () => { console.log('App is running on %s', chalk.bold.cyan(`http://localhost:${port}`)); });
