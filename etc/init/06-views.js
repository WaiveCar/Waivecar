var moment = require('moment');
var _ = require('lodash');
var _str = require('underscore.string');
_.mixin(_str.exports());

exports = module.exports = function(IoC, config) {

  var app = this;

  // TODO: limit to non API routes
  app.use(function(req, res, next) {
    res.locals.moment = moment;
    res.locals._ = _;
    res.locals.config = config;
    res.locals.req = req;
    res.locals.user = req.user;

    if (req.flash) {
      res.locals.messages = {
        success: req.flash('success'),
        error: req.flash('error'),
        info: req.flash('info'),
        warning: req.flash('warning')
      };
    }

    next();
  });

};

exports['@require'] = [ '$container', 'igloo/settings' ];
