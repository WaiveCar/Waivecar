var _ = require('lodash');
var async = require('async');
var moment = require('moment');
var path = require('path');
var Blueprint = require(path.join(process.env.PWD, 'lib', 'controller-blueprint'));

exports = module.exports = function(User, JobService, logger, config) {

  var methods = {
    meta: {
      config: config,
      controllerName: 'notifications'
    },

    beforeCreate: function(req, res, next) {
      var model = {
        user: req.user.id
      };

      return next(null, model);
    },

    create: function(req, res, next) {
      var sender = {};
      var report = {};
      var recipients = req.body.recipients;
      if (!recipients || recipients.length === 0) return next(new Error('Emails are required'));

      async.series([
        function(nextTask) {
          User.findById(req.user.id).exec(function(err, user) {
            if (err) return next(err);
            if (!user) return next(new Error('User not found'));
            sender.email = user.email;
            sender.name = user.name;
            return nextTask();
          });
        },
        function(nextTask) {
          async.each(recipients, function(recipient, done) {
            var data = {
              to: recipient,
              templateName: 'share',
              context: {
                from: sender.email,
                subject: req.body.subject || sender.name + ' has shared this with you.',
                message: req.body.message || sender.name + ' has shared this with you.',
                item: {
                  name: 'not-available',
                  url: 'not-available'
                }
              }
            };
            JobService.enqueue('email', data, done);
          }, nextTask);
        },
      ], function(err) {
        var model = {
          emails: recipients,
          item: {}
        };

        return res.format({
          json: function() {
            res.json(model);
          }
        });
      });
    }

  };

  return _.merge(new Blueprint(methods.meta), methods);
};

exports['@singleton'] = true;
exports['@require'] = [ 'models/user', 'services/job-service', 'igloo/logger', 'igloo/settings' ];
