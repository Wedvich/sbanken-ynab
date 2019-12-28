require('dotenv').config();

process.env.NODE_ENV = 'development';

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { DefinePlugin } = require('webpack');

module.exports = (env, argv) => {
  return {
    devServer: {
      historyApiFallback: true,
    },
    devtool: 'eval-source-map',
    entry: {
      'app': ['react-hot-loader/patch', path.resolve(__dirname, 'src/index.tsx')],
    },
    mode: 'development',
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          exclude: /node_modules/,
          use: [
            require.resolve('babel-loader'),
            require.resolve('eslint-loader'),
          ],
        },
        {
          test: /\.s?css$/,
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
      ],
    },
    output: {
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
    ],
    resolve: {
      alias: {
        'react-dom': require.resolve('@hot-loader/react-dom'),
      },
      extensions: ['.js', '.ts', '.tsx'],
    },
    stats: {
      modules: false,
      entrypoints: false,
      children: false,
    },
  };
};
