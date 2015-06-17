var serveStatic = require('serve-static');

exports = module.exports = function(config) {
  return function (app){
    app.use(serveStatic(config.publicDir, config.staticServer));
  };
};

exports['@singleton'] = true;
exports['@require'] = ['igloo/settings'];
