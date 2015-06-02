var _ = require('lodash');

exports = module.exports = function(NotificationsService, config, logger) {

  var svc = {

    concurrency: 10,

    process: function (job, next) {
      if (_.contains(config.jobs.skipProcessingIn, config.server.env)) {
        logger.debug('notify: Skipping Job');
        return next();
      }

      NotificationsService.sendNotification(job.data, function(err) {
        if (err) {
          job.failed().error(err);
          return next(err);
        }

        return next();
      });
    }

  };

  return svc;
};

exports['@singleton'] = true;
exports['@require'] = [ 'services/notifications-service', 'igloo/settings', 'igloo/logger' ];
