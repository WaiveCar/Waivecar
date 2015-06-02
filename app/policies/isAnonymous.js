exports = module.exports = function() {
  return function(req, res, next) {
    if (req && (req.user || req.cookies && req.cookies['auth_token'])) {
      var forbiddenError = new Error('You are not authorized to perform this function.');
      forbiddenError.status = 403;
      return next(forbiddenError);
    }

    return next();
  };

};

exports['@singleton'] = true;
exports['@require'] = [ ];
