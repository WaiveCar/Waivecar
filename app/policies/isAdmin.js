exports = module.exports = function(AuthService) {

  return function(req, res, next) {
    AuthService.isAdmin(req.user, function(err, isAdmin) {
      if (isAdmin) return next();
      return res.status(403).send({ message: 'You are not authorized to perform this request. Contact Us if you believe this to be incorrect.' });
    });
  };
};

exports['@singleton'] = true;
exports['@require'] = [ 'services/auth-service' ];
