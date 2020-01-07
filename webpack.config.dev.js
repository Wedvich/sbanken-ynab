require('dotenv').config();
process.env.NODE_ENV = 'development';

const merge = require('webpack-merge');
const baseConfig = require('./webpack.config.base');

module.exports = merge.smart(baseConfig, {
  devServer: {
    historyApiFallback: true,
  },
  devtool: 'eval-source-map',
  mode: 'development',
});
