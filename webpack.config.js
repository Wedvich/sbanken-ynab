require('dotenv').config();

const path = require('path');
const HtmlPlugin = require('html-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

const port = process.env.PORT || 3000;

const entry = ['./src/index'];
if (isDevelopment) {
  entry.unshift('react-hot-loader/patch');
}

const plugins = [
  new HtmlPlugin({
    template: './src/index.html',
  }),
];

module.exports = {
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? 'source-map' : 'eval-source-map',
  entry,
  output: {
    path: path.resolve(__dirname, 'public'),
  },
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
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
    open: true,
    port, 
  },
};
