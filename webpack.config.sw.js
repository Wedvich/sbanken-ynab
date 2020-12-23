require('dotenv').config();
process.env.NODE_ENV = 'production';

const path = require('path');
const WebpackBar = require('webpackbar');

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
        use: [require.resolve('babel-loader'), require.resolve('eslint-loader')],
      },
    ],
  },
  output: {
    path: path.join(__dirname, 'wwwroot'),
  },
  plugins: [
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
