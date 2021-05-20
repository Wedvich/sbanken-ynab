require('dotenv').config();
process.env.NODE_ENV = 'production';

const path = require('path');
const WebpackBar = require('webpackbar');
const { EnvironmentPlugin } = require('webpack');
const EslintWebpackPlugin = require('eslint-webpack-plugin');
const { DefinePlugin } = require('webpack');
const { revision } = require('./webpack.config.base');

module.exports = () => ({
  devtool: false,
  entry: {
    sw: path.resolve(__dirname, 'src/service-worker/index.ts'),
  },
  mode: process.env.NODE_ENV,
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/i,
        exclude: /node_modules/,
        use: [require.resolve('babel-loader')],
      },
    ],
  },
  output: {
    path: path.join(__dirname, 'wwwroot'),
  },
  plugins: [
    new DefinePlugin({
      'process.env.REVISION': `"${revision}"`,
    }),
    new EnvironmentPlugin(['NODE_ENV']),
    new EslintWebpackPlugin(),
    new WebpackBar({
      color: 'skyblue',
      name: 'Service Worker',
    }),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.d.ts'],
  },
  stats: {
    modules: false,
    entrypoints: false,
    children: false,
  },
  target: 'webworker',
});
