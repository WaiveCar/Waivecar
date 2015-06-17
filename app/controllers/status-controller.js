var os = require('os');
var _ = require('lodash');
var async = require('async');
var moment = require('moment');

exports = module.exports = function(config, logger) {

  var methods = {
    index: function(req, res, next) {
      var model = {};
      async.parallel([
        function(nextTask) {
          try {
            model.memory = {
              total: os.totalmem(),
              free: os.freemem()
            };
            model.memory.used = model.memory.total - model.memory.free;
          } catch(e) {
            logger.error(e);
          }

          return nextTask();
        },
      ], function(err) {
        if (err) return next(err);

        return res.format({
          json: function() {
            res.json(model);
          }
        });
      });
    }
  };

  return methods;
};

exports['@singleton'] = true;
exports['@require'] = [ 'igloo/settings', 'igloo/logger' ];
