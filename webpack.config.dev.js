require('dotenv').config();
process.env.NODE_ENV = 'development';

const path = require('path');
const merge = require('webpack-merge');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const baseConfig = require('./webpack.config.base');

module.exports = merge.smart({
  entry: {
    'app': ['react-hot-loader/patch'],
  },
}, baseConfig, {
  devServer: {
    historyApiFallback: true,
  },
  devtool: 'eval-source-map',
  mode: 'development',
  plugins: [
    new WatchMissingNodeModulesPlugin(path.join(__dirname, 'node_modules')),
  ],
  resolve: {
    alias: {
      'react-dom': require.resolve('@hot-loader/react-dom'),
    },
  },
});
