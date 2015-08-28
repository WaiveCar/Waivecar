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
      'react-redux',
      'react-router',
      'reach-react',
      'reach-components',
      'redux',
      'md5',
      'socket.io-client'
    ]
  },
  output : {
    path     : path.join(__dirname, '../../', 'app', 'scripts'),
    filename : 'bundle.js'
  },
  resolve : {
    extensions : [ '', '.js', '.jsx' ],
    alias      : {
      interface          : path.join(__dirname, '../../', 'src', 'interface'),
      modules            : path.join(__dirname, '../../', 'src', 'modules'),
      components         : path.join(__dirname, '../../', 'src', 'components'),
      config             : path.join(__dirname, '../../', 'src', 'config.js'),
      styles             : path.join(__dirname, '../../', 'src', 'styles'),
      'reach-react'      : path.join(__dirname, '../../', 'src', 'vendors', 'reach-react'),
      'reach-components' : path.join(__dirname, '../../', 'src', 'vendors', 'reach-components')
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
    new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js')
  ]
}