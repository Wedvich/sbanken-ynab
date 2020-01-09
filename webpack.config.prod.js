require('dotenv').config();
process.env.NODE_ENV = 'production';

const merge = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const SriPlugin = require('webpack-subresource-integrity');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const baseConfig = require('./webpack.config.base');

module.exports = (env = {}) => merge.smart(baseConfig, {
  devtool: false,
  mode: 'production',
  output: {
    crossOriginLoading: 'anonymous',
    filename: '[name].[hash].js',
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[hash].css',
    }),
    new CopyWebpackPlugin([
      'src/resources/robots.txt',
    ]),
    new SriPlugin({
      hashFuncNames: ['sha512', 'sha3-512'],
    }),
    env.analyze && new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)(),
  ].filter(Boolean),
});
