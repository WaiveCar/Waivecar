var path        = require('path');
var webpack     = require('webpack');
var nodeModules = path.join(__dirname, '../../', 'node_modules');
var config      = require('bentojs-config')(path.resolve('./config'), path.resolve('./src/config.js'));

module.exports = {
  entry : {
    app     : path.join(__dirname, '../../', 'src', 'index.js'),
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
    path     : path.join(__dirname, '../../', 'app'),
    filename : 'scripts/bundle.js'
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
        exclude : [ nodeModules ],
        loader  : 'babel'
      },
      {
        test    : /(\.scss|\.css)$/,
        include : path.join(__dirname, '../../', 'src'),
        loaders : [ 'style', 'css', 'sass' ]
      },
      {
        test    : /(\.scss|\.css)$/,
        include : /(node_modules)\/react-toolbox/,
        loaders : [
          require.resolve('style-loader'),
          require.resolve('css-loader') + '?sourceMap&modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]',
          require.resolve('sass-loader') + '?sourceMap',
          'toolbox'
        ]
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loader: 'url-loader?limit=100000'
      }
    ]
  },
  toolbox : {
    theme : path.join(__dirname, '../../', 'src', 'styles', 'toolbox-theme.scss')
  },
  plugins : [
    new webpack.optimize.CommonsChunkPlugin('vendors', 'scripts/vendors.js')
  ]
}
