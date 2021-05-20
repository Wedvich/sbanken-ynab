const path = require('path');
const { execSync } = require('child_process');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { EnvironmentPlugin } = require('webpack');
const WebpackBar = require('webpackbar');
const EslintWebpackPlugin = require('eslint-webpack-plugin');
const { DefinePlugin } = require('webpack');

const isDev = process.env.NODE_ENV === 'development';

const revision = execSync('git rev-parse HEAD').toString().trim().slice(0, 7);

const createBaseConfig = () => ({
  entry: {
    app: [path.resolve(__dirname, 'src/index.tsx')],
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/i,
        exclude: /node_modules/,
        use: [require.resolve('babel-loader')],
      },
      {
        test: /\.s?css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: require.resolve('css-loader'),
            options: {
              importLoaders: 1,
              sourceMap: isDev,
            },
          },
          {
            loader: require.resolve('postcss-loader'),
            options: {
              sourceMap: isDev,
            },
          },
        ],
      },
      {
        test: /\.svg$/i,
        loader: require.resolve('svg-inline-loader'),
        options: {
          removeTags: true,
        },
      },
      {
        test: /\.woff$/i,
        loader: require.resolve('file-loader'),
        options: {
          name: '[name].[contenthash].[ext]',
        },
      },
    ],
  },
  output: {
    path: path.join(__dirname, 'wwwroot'),
    publicPath: '/',
  },
  plugins: [
    new EnvironmentPlugin(['NODE_ENV']),
    new DefinePlugin({
      'process.env.REVISION': `"${revision}"`,
    }),
    new EslintWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
    }),
    new WebpackBar({
      color: 'hotpink',
      name: 'App           ',
    }),
  ],
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
    },
    extensions: ['.js', '.ts', '.tsx', '.d.ts'],
  },
  stats: {
    modules: false,
    entrypoints: false,
    children: false,
  },
});

module.exports = {
  createBaseConfig,
  revision,
};
