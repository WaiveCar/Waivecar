var helmet = require('helmet');

exports = module.exports = function(IoC, config) {

  var app = this;

  // Disable cache if config say so
  if (!config.cache) {
    app.use(helmet.nocache());
  } else {
    // Enable cache if NOT an XHR (AJAX) request
    app.use(function(req, res, next) {
      if (req.xhr) return next();

      res.setHeader('Cache-Control', 'public');
      res.setHeader('Pragma', '');
      res.setHeader('Expires', config.staticServer.maxAge);
      next();
    });
  }

};

exports['@require'] = [ '$container', 'igloo/settings' ];
