const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
// html-webpack-inline-source-plugin.d.ts
// declare module 'html-webpack-inline-source-plugin';
const webpack = require('webpack');
const path = require('path');
// console.log(argv)


module.exports = (env, argv) => {
    
    console.log(argv);
    
    return {
  mode: argv.mode === 'production' ? 'production' : 'development',
  devtool: argv.mode === 'production' ? false : 'inline-source-map',

  entry: {
    ui: './src/ui.js',
    code: './src/code.js',
  },

  module: {
      rules: [
        {
            test: /\.css$/,
            use: [
              'style-loader',
              'css-loader',
            ],
          },

        {
          test: /\.js?$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              cacheDirectory: true,
              cacheCompression: false,
              envName: argv.mode === 'production' ? "production" : "development"
            }
          }
        }          

      ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/ui.html',
      filename: 'ui.html',
      inlineSource: '.(js)$',
      chunks: ['ui'],
    }),
    new HtmlWebpackInlineSourcePlugin(),
  ],

  

}}