var os = require('os');
var _ = require('lodash');
var async = require('async');
var moment = require('moment');

exports = module.exports = function(EnumService, config, logger) {

  var methods = {
    index: function(req, res, next) {
      return res.format({
        json: function() {
          res.json(EnumService.getRoleTypes());
        }
      });
    }
  };

  return methods;
};

exports['@singleton'] = true;
exports['@require'] = [ 'services/enum-service', 'igloo/settings', 'igloo/logger' ];
