var compress = require('compression');
var https = require('https');
var http = require('http');
// var Socket = require('socket.io');
// var redis = require('socket.io-redis');

exports = module.exports = function(IoC, config) {

  var app = this;

// set the default views directory/engine
  app.set('views', config.views.dir);
  app.set('view engine', config.views.engine);

  if (config.server.env === 'development') {
    app.locals.pretty = true;
  }

  if (config.server.env === 'production') {
    app.enable('view cache');
    app.use(compress());
  }

  if (config.server.ssl.enabled) {
    this.server = https.createServer(config.server.ssl.options, this);
  } else {
    this.server = http.createServer(this);
  }

  // include socket support.
  // app.io = new Socket(app.server);
  // app.io.adapter(redis({ host: 'localhost' }));

  // app.io.set('origins', '*:*');

};

exports['@require'] = [ '$container', 'igloo/settings' ];
