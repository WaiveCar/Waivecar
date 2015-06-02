exports = module.exports = function() {

  return function(req, res, next) {
    if (req.user) return next();
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      var forbiddenError = new Error('You are not authenticated to perform this request. Contact Us if you believe this to be incorrect.');
      forbiddenError.status = 401;
      return next(forbiddenError);
    }

    return res.redirect('/signin?returnUrl=' + req.originalUrl);
  };

};

exports['@singleton'] = true;
exports['@require'] = [ ];
