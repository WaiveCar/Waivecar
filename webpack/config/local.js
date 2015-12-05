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
      'bento',
      'bento-ui',
      'bento-web',
      'bento-service',
      'md5',
      'react',
      'react-dom',
      'react-mixin',
      'react-router'
    ]
  },
  output : {
    path       : path.join(__dirname, '../../', 'app'),
    filename   : 'scripts/bundle.js',
    publicPath : '/'
  },
  resolve : {
    extensions : [ '', '.js', '.jsx', '.scss' ],
    modulesDirectories: [
      'node_modules',
      path.resolve(__dirname, './node_modules')
    ],
    alias      : {
      'bento'         : path.join(__dirname, '../../', 'src', 'modules', 'bento'),
      'bento-service' : path.join(__dirname, '../../', 'src', 'modules', 'bento-service'),
      'bento-ui'      : path.join(__dirname, '../../', 'src', 'modules', 'bento-ui'),
      'bento-web'     : path.join(__dirname, '../../', 'src', 'modules', 'bento-web'),
      'config'        : path.join(__dirname, '../../', 'src', 'config'),
      styles          : path.join(__dirname, '../../', 'src', 'styles'),
      policies        : path.join(__dirname, '../../', 'src', 'policies'),
      views           : path.join(__dirname, '../../', 'src', 'views')
    }
  },
  module : {
    loaders : [
      {
        test    : /(\.js|\.jsx)$/,
        loaders : [ 'react-hot', 'babel' ],
        include : path.join(__dirname, '../../', 'src')
      },
      {
        test    : /\.scss$/,
        loaders : [ 'style', 'css', 'sass', 'toolbox' ]
      }
    ]
  },
  toolbox : {
    theme : path.join(__dirname, '../../', 'src', 'styles', 'toolbox-theme.scss')
  },
  plugins : [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.CommonsChunkPlugin('vendors', 'scripts/vendors.js')
  ]
}
