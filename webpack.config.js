const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';

  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: isProd ? 'assets/[name].[contenthash:8].js' : 'assets/[name].js',
      publicPath: '/',
      clean: true
    },
    resolve: {
      extensions: ['.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: 'babel-loader'
        },
        {
          test: /\.module\.scss$/,
          use: [
            isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            { loader: 'css-loader', options: { modules: { localIdentName: '[name]__[local]___[hash:base64:5]' } } },
            'sass-loader'
          ]
        },
        {
          test: /\.scss$/,
          exclude: /\.module\.scss$/,
          use: [
            isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'sass-loader'
          ]
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg|woff2?|ttf|otf)$/,
          type: 'asset/resource',
          generator: { filename: 'assets/[name].[hash:8][ext]' }
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({ template: 'public/index.html' }),
      new MiniCssExtractPlugin({ filename: 'assets/[name].[contenthash:8].css' }),
      new Dotenv({ path: `.env.${process.env.APP_ENV || 'dev'}`, systemvars: true, safe: false })
    ],
    devServer: {
      port: 3000,
      historyApiFallback: true,
      hot: true,
      open: false
    },
    devtool: isProd ? 'source-map' : 'eval-cheap-module-source-map'
  };
};
