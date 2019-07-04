var path             = require('path');
var config           = require('bentojs-config')(path.resolve('./config'), path.resolve('./src/config.js'));
var webpack          = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var webpackConfig    = require('./webpack/config/local.js');

new WebpackDevServer(webpack(webpackConfig), {
  contentBase        : './app',
  publicPath         : '/',
  hot                : true,
  historyApiFallback : true,
  headers            : { "Access-Control-Allow-Origin" : "*" },
  watchOptions: {
    poll: true,
  }
}).listen(config.app.port, '0.0.0.0', function (err, result) {
  if (err) {
    console.log(err);
  }
  console.log('Listening at %s:%s', config.app.uri, config.app.port);
});
