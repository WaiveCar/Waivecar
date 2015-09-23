'use strict';

var path    = require('path');
var webpack = require('webpack');
var config  = require('../../src/config.js');

module.exports = {
  devtool : 'eval',
  entry   : {
    app : [
      'webpack-dev-server/client?' + config.app.uri + ':' + config.app.port,
      'webpack/hot/only-dev-server',
      './src/index'
    ],
    vendors : [
      'react',
      'react-dom',
      'react-router',
      'reach-react',
      'react-mixin',
      'md5'
    ]
  },
  output : {
    path       : path.join(__dirname, '../../', 'app'),
    filename   : 'scripts/bundle.js',
    publicPath : '/'
  },
  resolve : {
    extensions : [ '', '.js', '.jsx' ],
    alias      : {
      modules            : path.join(__dirname, '../../', 'src', 'modules'),
      components         : path.join(__dirname, '../../', 'src', 'components'),
      config             : path.join(__dirname, '../../', 'src', 'config.js'),
      styles             : path.join(__dirname, '../../', 'src', 'styles'),
      policies           : path.join(__dirname, '../../', 'src', 'policies'),
      views              : path.join(__dirname, '../../', 'src', 'views'),
      'reach-react'      : path.join(__dirname, '../../', 'src', 'vendors', 'reach-react'),
      'reach-components' : path.join(__dirname, '../../', 'src', 'vendors', 'reach-components'),
      'reach-ui'         : path.join(__dirname, '../../', 'src', 'vendors', 'reach-ui'),
      'react-sparklines' : path.join(__dirname, '../../', 'src', 'vendors', 'react-sparklines')
    }
  },
  module : {
    loaders : [
      {
        test    : /\.jsx?$/,
        loaders : [ 'react-hot', 'babel' ],
        include : path.join(__dirname, '../../', 'src')
      },
      {
        test    : /\.scss$/,
        loaders : [ 'style', 'css', 'sass' ]
      }
    ]
  },
  plugins : [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.CommonsChunkPlugin('vendors', 'scripts/vendors.js')
  ]
}