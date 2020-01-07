require('dotenv').config();
process.env.NODE_ENV = 'production';

const merge = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const baseConfig = require('./webpack.config.base');

module.exports = merge.smart(baseConfig, {
  devtool: false,
  mode: 'production',
  plugins: [
    new CopyWebpackPlugin([
      'src/resources/robots.txt',
    ]),
  ],
});
