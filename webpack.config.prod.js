require('dotenv').config();
process.env.NODE_ENV = 'production';

const merge = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const SriPlugin = require('webpack-subresource-integrity');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const baseConfig = require('./webpack.config.base');
const createSwConfig = require('./webpack.config.sw');

const createProdConfig = (env = {}) =>
  merge.smart(baseConfig, {
    devtool: 'source-map',
    mode: process.env.NODE_ENV,
    output: {
      crossOriginLoading: 'anonymous',
      filename: '[name].[hash].js',
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].[hash].css',
      }),
      new CopyWebpackPlugin({
        patterns: [{ from: 'src/resources/robots.txt' }],
      }),
      new SriPlugin({
        hashFuncNames: ['sha512'],
      }),
      new ManifestPlugin(),
      env.analyze && new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)(),
    ].filter(Boolean),
  });

module.exports = (env = {}) => [createProdConfig(env), createSwConfig(env)];
