const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    popup: './src/popup/popup.js',
    options: './src/options/options.js',
    background: './src/background/background.js',
    content: './src/content/content.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/popup/popup.html',
      filename: 'popup.html',
      chunks: ['popup'],
    }),
    new HtmlWebpackPlugin({
      template: './src/options/options.html',
      filename: 'options.html',
      chunks: ['options'],
    }),
    new CopyPlugin({
      patterns: [
        { from: "manifest.json", to: "." },
        { from: "src/assets", to: "assets" },
        { from: "src/popup/popup.css", to: "popup.css" },
        { from: "src/options/options.css", to: "options.css" },
      ],
    }),
  ],
};
