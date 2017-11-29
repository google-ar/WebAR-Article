/*
 * Copyright 2017 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var fs = require('fs');
var path = require('path');
var webpack = require('webpack');
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');
var licensePath = path.join(__dirname, 'licenses.txt');
var license = fs.readFileSync(licensePath, 'utf8');

module.exports = {
  entry: {
    'index.js': './src/index.js',
    'index.min.js': './src/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'public/js'),
    filename: '[name]',
  },
  module: {
    rules: [
      { test: /\.js/, exclude: /node_modules/, use: ['babel-loader'] },
      {
        test: /\.(glsl|frag|vert)$/,
        exclude: /node_modules/,
        loader: 'glslify-import-loader',
      },
      {
        test: /\.(glsl|frag|vert)$/,
        exclude: /node_modules/,
        loader: 'raw-loader',
      },
      {
        test: /\.(glsl|frag|vert)$/,
        exclude: /node_modules/,
        loader: 'glslify-loader',
      },
      {
        test: /\.html$/,
        loader: 'raw-loader',
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
      {
        test: /\.(png)$/,
        exclude: /node_modules/,
        use: ['base64-image-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js'],
  },
  devServer: {
    publicPath: '/public/js',
    contentBase: [path.resolve(__dirname)],
    host: '0.0.0.0',
    disableHostCheck: true,
  },
  stats: {
    colors: true,
  },
  devtool: 'source-map',
  plugins: [
    new UglifyJSPlugin({
      // The unbundled plugin also needs 'test' instead of 'include' (?),
      test: /\.min\.js$/,
    }),
    new webpack.BannerPlugin({ banner: license, raw: true }),
  ],
};
