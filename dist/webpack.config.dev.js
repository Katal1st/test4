"use strict";

var path = require('path');

var HTMLWebpackPlugin = require('html-webpack-plugin');

var _require = require('clean-webpack-plugin'),
    CleanWebpackPlugin = _require.CleanWebpackPlugin;

var CopyWebpackPlugin = require('copy-webpack-plugin');

var MiniCssExtractPlugin = require('mini-css-extract-plugin');

var CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');

var TerserWebpackPlugin = require('terser-webpack-plugin');

var _require2 = require('webpack-bundle-analyzer'),
    BundleAnalyzerPlugin = _require2.BundleAnalyzerPlugin;

var isDev = process.env.NODE_ENV === 'development';
var isProd = !isDev;

var optimization = function optimization() {
  var config = {
    splitChunks: {
      chunks: 'all'
    }
  };

  if (isProd) {
    config.minimizer = [new CssMinimizerWebpackPlugin(), new TerserWebpackPlugin()];
  }

  return config;
};

var filename = function filename(ext) {
  return isDev ? "[name].".concat(ext) : "[name].[hash].".concat(ext);
};

var cssLoaders = function cssLoaders(extra) {
  var loaders = [{
    loader: MiniCssExtractPlugin.loader,
    options: {// hmr: true,
      // reloadAll: true
    }
  }, 'css-loader'];

  if (extra) {
    loaders.push(extra);
  }

  return loaders;
};

var babelOptions = function babelOptions(preset) {
  var opts = {
    presets: ['@babel/preset-env'],
    plugins: ['@babel/plugin-proposal-class-properties']
  };

  if (preset) {
    opts.presets.push(preset);
  }

  return opts;
};

var jsLoaders = function jsLoaders() {
  var loaders = [{
    loader: 'babel-loader',
    options: babelOptions()
  }];

  if (isDev) {
    loaders.push('eslint-loader');
  }

  return loaders;
};

var plugins = function plugins() {
  var base = [new HTMLWebpackPlugin({
    template: './components/pages/index.pug',
    minify: {
      collapseWhitespace: isProd
    }
  }), new CleanWebpackPlugin(), new CopyWebpackPlugin({
    patterns: [{
      from: path.resolve(__dirname, 'src/favicon.ico'),
      to: path.resolve(__dirname, 'dist')
    }]
  }), new MiniCssExtractPlugin({
    filename: filename('css')
  })];

  if (isProd) {
    base.push(new BundleAnalyzerPlugin());
  }

  return base;
};

module.exports = {
  context: path.resolve(__dirname, 'src'),
  mode: 'development',
  entry: {
    main: ['@babel/polyfill', './index.jsx'],
    analytics: './analytics.ts'
  },
  output: {
    filename: filename('js'),
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    extensions: ['.js', '.json', '.png'],
    alias: {
      '@models': path.resolve(__dirname, 'src/models'),
      '@': path.resolve(__dirname, 'src')
    }
  },
  optimization: optimization(),
  devServer: {
    port: 4200,
    open: true
  },
  devtool: isDev ? 'source-map' : false,
  plugins: plugins(),
  module: {
    rules: [{
      test: /\.pug$/,
      loader: "pug-loader"
    }, {
      test: /\.css$/,
      use: cssLoaders()
    }, {
      test: /\.less$/,
      use: cssLoaders('less-loader')
    }, {
      test: /\.s[ac]ss$/,
      use: cssLoaders('sass-loader')
    }, {
      test: /\.(png|jpg|svg|gif)$/,
      use: ['file-loader']
    }, {
      test: /\.(ttf|woff|woff2|eot)$/,
      use: ['file-loader']
    }, {
      test: /\.xml$/,
      use: ['xml-loader']
    }, {
      test: /\.csv$/,
      use: ['csv-loader']
    }, {
      test: /\.js$/,
      exclude: /node_modules/,
      use: jsLoaders()
    }, {
      test: /\.ts$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      options: babelOptions('@babel/preset-typescript')
    }, {
      test: /\.jsx$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      options: babelOptions('@babel/preset-react')
    }]
  }
};