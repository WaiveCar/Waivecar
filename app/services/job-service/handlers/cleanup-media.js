var _ = require('lodash');

exports = module.exports = function(MediaCleanupService, config, logger) {

  var svc = {

    concurrency: 10,

    process: function (job, next) {
      if (_.contains(config.jobs.skipProcessingIn, config.server.env)) {
        logger.debug('Email: Skipping Job');
        return next();
      }

      MediaCleanupService.deleteFile(job.data, function(err) {
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
exports['@require'] = [ 'services/media-cleanup-service', 'igloo/settings', 'igloo/logger' ];