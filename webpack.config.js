require('dotenv').config();

const path = require('path');
const HtmlPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackBar = require('webpackbar');

const { getHttpsOptions } = require('./utils');

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3000;

const entry = ['./src/index'];
if (isDevelopment) {
  entry.unshift('react-hot-loader/patch');
}

const plugins = [
  new HtmlPlugin({
    template: './src/index.html',
  }),
  new WebpackBar(),
];

if (isProduction) {
  plugins.push(new MiniCssExtractPlugin());
}

module.exports = {
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? 'source-map' : 'eval-source-map',
  entry,
  output: {
    path: path.resolve(__dirname, 'public'),
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.s?css$/,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.ttf$/,
        use: {
          loader: 'file-loader',
          options: {
            name: 'fonts/[name].[ext]',
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      'react-dom': !isProduction ? '@hot-loader/react-dom' : 'react-dom',
    },
  },
  plugins,
  devServer: {
    historyApiFallback: true,
    host,
    http2: true,
    https: getHttpsOptions(),
    open: true,
    port,
    stats: {
      children: false,
      modules: false,
    },
  },
};
