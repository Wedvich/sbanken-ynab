require('dotenv').config();
process.env.NODE_ENV = 'production';

const { merge } = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const { createBaseConfig, revision } = require('./webpack.config.base');
const createSwConfig = require('./webpack.config.sw');

const createProdConfig = (env = {}) =>
  merge(createBaseConfig(env), {
    devtool: 'source-map',
    mode: process.env.NODE_ENV,
    output: {
      crossOriginLoading: 'anonymous',
      filename: `[name].${revision}.js`,
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: `[name].${revision}.css`,
      }),
      new CopyWebpackPlugin({
        patterns: [{ from: 'src/resources/robots.txt' }, { from: 'src/resources/app.json' }],
      }),
      new WebpackManifestPlugin(),
    ].filter(Boolean),
  });

module.exports = (env = {}) => {
  env.analyze = env.analyze ?? process.argv.includes('--analyze');
  return [createProdConfig(env), !env.analyze && createSwConfig(env)].filter(Boolean);
};
