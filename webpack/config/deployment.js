'use strict';

var path        = require('path');
var webpack     = require('webpack');
var nodeModules = path.join(__dirname, '../../', 'node_modules');

module.exports = {
  entry : {
    app     : path.join(__dirname, '../../', 'src', 'index.js'),
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
    path     : path.join(__dirname, '../../', 'app'),
    filename : 'scripts/bundle.js'
  },
  resolve : {
    extensions : [ '', '.js', '.jsx' ],
    alias      : {
      config             : path.join(__dirname, '../../', 'src', 'config.js'),
      styles             : path.join(__dirname, '../../', 'src', 'styles'),
      policies           : path.join(__dirname, '../../', 'src', 'policies'),
      views              : path.join(__dirname, '../../', 'src', 'views'),
      'reach-react'      : path.join(__dirname, '../../', 'src', 'modules', 'reach-react'),
      'reach-components' : path.join(__dirname, '../../', 'src', 'modules', 'reach-components'),
      'reach-ui'         : path.join(__dirname, '../../', 'src', 'modules', 'reach-ui'),
      'react-sparklines' : path.join(__dirname, '../../', 'src', 'modules', 'react-sparklines')
    }
  },
  module : {
    loaders : [
      {
        test    : /\.jsx?$/,
        exclude : [ nodeModules ],
        loader  : 'babel'
      },
      {
        test    : /\.scss$/,
        loaders : [ 'style', 'css', 'sass' ]
      }
    ]
  },
  plugins : [
    new webpack.optimize.CommonsChunkPlugin('vendors', 'scripts/vendors.js')
  ]
}