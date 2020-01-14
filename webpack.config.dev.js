require('dotenv').config();
process.env.NODE_ENV = 'development';

const path = require('path');
const merge = require('webpack-merge');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { DefinePlugin } = require('webpack');
const baseConfig = require('./webpack.config.base');

module.exports = merge.smart({
  entry: {
    'app': ['react-hot-loader/patch'],
  },
}, baseConfig, {
  devServer: {
    historyApiFallback: true,
    port: process.env.PORT || 8000,
  },
  devtool: 'cheap-module-source-map',
  mode: 'development',
  plugins: [
    new DefinePlugin({
      'process.env.SBANKEN_CLIENT_ID': `'${process.env.SBANKEN_CLIENT_ID || ''}'`,
      'process.env.SBANKEN_CLIENT_SECRET': `'${process.env.SBANKEN_CLIENT_SECRET || ''}'`,
      'process.env.SBANKEN_CUSTOMER_ID': `'${process.env.SBANKEN_CUSTOMER_ID || ''}'`,
      'process.env.YNAB_PERSONAL_ACCESS_TOKEN': `'${process.env.YNAB_PERSONAL_ACCESS_TOKEN || ''}'`,
      'process.env.YNAB_BUDGET_ID': `'${process.env.YNAB_BUDGET_ID || ''}'`,
    }),
    new MiniCssExtractPlugin(),
    new WatchMissingNodeModulesPlugin(path.join(__dirname, 'node_modules')),
  ],
  resolve: {
    alias: {
      'react-dom': require.resolve('@hot-loader/react-dom'),
    },
  },
});
