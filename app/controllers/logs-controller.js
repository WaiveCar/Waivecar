var _ = require('lodash');
var moment = require('moment');
var path = require('path');
var Blueprint = require(path.join(process.env.PWD, 'lib', 'controller-blueprint'));
var fs = require('fs');
var async = require('async');
var util = require('util');

exports = module.exports = function(logger, config) {

  var methods = {

    create: function (req, res, next) {

      var options = {
        type: req.body.type || 'error',
        browser: req.body.browser ? JSON.stringify(req.body.browser) : 'NA',
        url: req.body.url,
        message: req.body.message,
        stackTrace: req.body.stackTrace,
        cause: req.body.cause
      };

      options = methods.sanitize(options);

      if (options.stackTrace) {
        if (_.isArray(options.stackTrace)) {
          options.stackTrace = options.stackTrace.join('\n             ').trim();
        } else {
          options.stackTrace = options.stackTrace + '\n';
        }
      }

      if (options.cause) {
        if (_.isArray(options.cause)) {
          options.cause = options.cause.join('\n             ').trim();
        } else {
          options.cause = options.cause + '\n';
        }
      }

      options.userDetails = req.user || 'NA';

      return methods.log(options, function(err) {
        if (err) return next(err);
        return res.format({
          json: function() {
            res.json();
          }
        });
      });
    },

    sanitize : function(o) {
      var clone = _.clone(o);
      _.each(clone, function (v, k) {
        if (v === undefined || v === null || v === '') {
          delete clone[k];
        }
      });
      return clone;
    },

    log: function(options, next) {
      var output = util.format('Client-side %s\n' +
        'User:        %s\n' +
        'Browser:     %s\n' +
        'URL:         %s\n' +
        'Message:     %s\n' +
        'Stack Trace: %s\n' +
        'Cause:       %s', options.type, options.userDetails, options.browser, options.url, options.message, options.stackTrace || '', options.cause || '');

      switch (options.type) {
        case 'debug':
          logger.debug(output);
          break;
        case 'info':
          logger.info(output);
          break;
        default:
          logger.error(output);
          break;
      }

      if (next) {
        next();
      }
    }
  };
  return methods;
};

exports['@singleton'] = true;
exports['@require'] = [ 'igloo/logger', 'igloo/settings' ];
