var path = require('path');
var serveFavicon = require('serve-favicon');

exports = module.exports = function(config) {
  return function (app){
    // ignore GET /favicon.ico
    app.use(serveFavicon(path.join(config.publicDir, 'favicon.ico')));
  };
};

exports['@singleton'] = true;
exports['@require'] = ['igloo/settings'];
