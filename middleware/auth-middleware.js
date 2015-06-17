var auth = require('basic-auth');

exports = module.exports = function(config) {
  var notApiRouteRegexp = /^(?!\/v1\/).*$/;

  return function (app){
    if (config.basicAuth.enabled){
      app.all(notApiRouteRegexp, function(req, res, next) {
        var creds = auth(req);
        if (!creds || creds.name !== config.basicAuth.name || creds.pass !== config.basicAuth.pass) {
          res
            .header('WWW-Authenticate', 'Basic realm="Development Environment"')
            .status(401)
            .end();
          return;
        }
        next();
      });
    }
  };
};

exports['@singleton'] = true;
exports['@require'] = ['igloo/settings'];
