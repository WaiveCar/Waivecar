exports = module.exports = function(User, AuthService, logger, config) {

  return function(req, res, next) {
    var token;
    var authError = new Error('You must be authenticated to perform this action.');
    authError.status = 401;

    if (config.bypassSecurity) {
      User.findOne({ email: config.admin.email }).exec(function(err, user) {
        if (err || !user) return next(authError);
        user.getPermissions(function(err, permissions) {
          logger.warn('BYPASSING SECURITY');
          req.permissions = permissions;
          req.user = user;
          logger.warn('req.user has been manually set to use the default admin account (%s).', user.email);
          return next();
        });
      });
    } else {

      /*jshint camelcase: false */
      if (req.cookies && req.cookies.auth_token) {
        token = req.cookies.auth_token;
      } else if (req.params.token) {
        token = req.params.token;
        // We delete the token from param to not mess with blueprints
        delete req.query.token;
      } else if (req.headers.authorization) {
        // Expected route.
        token = req.headers.authorization.split(' ')[1];
      }


      // If no token set, pass-through (we exepect other policies to produce a 401 if necessary)
      if (!token) return next();

      AuthService.verifyToken(token, function(err, token) {
        if (err) {
          logger.error(err);
          return next(authError);
        }

        req.token = token;
        User.findById(req.token.sub).exec(function(err, user) {
          if (err || !user) return next(authError);
          logger.debug('setting user to %s ', user.email);

          user.getPermissions(function(err, permissions) {
            req.permissions = permissions;
            req.user = user;
            return next();
          });
        });
      });
    }
  };

};

exports['@singleton'] = true;
exports['@require'] = [ 'models/user', 'services/auth-service', 'igloo/logger', 'igloo/settings' ];
