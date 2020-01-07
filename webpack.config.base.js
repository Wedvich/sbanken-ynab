const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const { DefinePlugin } = require('webpack');
const WebpackBar = require('webpackbar');

module.exports = {
  entry: {
    'app': ['react-hot-loader/patch', path.resolve(__dirname, 'src/index.tsx')],
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/i,
        exclude: /node_modules/,
        use: [
          require.resolve('babel-loader'),
          require.resolve('eslint-loader'),
        ],
      },
      {
        test: /\.s?css$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: true,
              reloadAll: true,
              sourceMap: true,
            },
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.svg$/i,
        loader: 'svg-inline-loader',
        options: {
          removeTags: true,
        },
      },
    ],
  },
  output: {
    path: path.join(__dirname, 'wwwroot'),
    publicPath: '/',
  },
  plugins: [
    new DefinePlugin({
      'process.env': {
        NODE_ENV: `'${process.env.NODE_ENV}'`,
        SBANKEN_CLIENT_ID: `'${process.env.SBANKEN_CLIENT_ID || ''}'`,
        SBANKEN_CLIENT_SECRET: `'${process.env.SBANKEN_CLIENT_SECRET || ''}'`,
        SBANKEN_CUSTOMER_ID: `'${process.env.SBANKEN_CUSTOMER_ID || ''}'`,
        YNAB_PERSONAL_ACCESS_TOKEN: `'${process.env.YNAB_PERSONAL_ACCESS_TOKEN || ''}'`,
        YNAB_BUDGET_ID: `'${process.env.YNAB_BUDGET_ID || ''}'`,
      },
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
    }),
    new MiniCssExtractPlugin(),
    new WatchMissingNodeModulesPlugin(path.join(__dirname, 'node_modules')),
    new WebpackBar({
      color: 'hotpink',
      name: 'Sbanken → YNAB',
    }),
  ],
  resolve: {
    alias: {
      'react-dom': require.resolve('@hot-loader/react-dom'),
    },
    extensions: ['.js', '.ts', '.tsx', '.d.ts'],
  },
  stats: {
    modules: false,
    entrypoints: false,
    children: false,
  },
};
