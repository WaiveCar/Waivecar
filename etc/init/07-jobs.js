var kue = require('kue');
var cluster = require('cluster');

exports = module.exports = function(JobService, tokenPassThrough, isAdmin, config, logger, done) {
  var app = this;
  if (cluster.isMaster) {
    var queue = JobService.getQueue();
    JobService.setupHandlers(function() {
      queue.on('job complete', function (id) {
        kue.Job.get(id, function (err, job) {
          if (err) return;

          if (!config.jobs.removeCompleted) {
            logger.info('Job \'' + job.type + '\' (id: ' + id + ') completed successfully.');
            return;
          }

          job.remove(function(err){
            if (err) {
              logger.error('Failed to remove completed Job \'' + job.type + '\' (id: ' + id + ').');
              return;
            }

            logger.info('Job \'' + job.type + '\' (id: ' + id + ') completed successfully.');
          });
        });
      })
      .on('job failed', function (id) {
        kue.Job.get(id, function (err, job) {
          if (err) return;

          logger.warn('Job \'' + job.type + '\' (id: ' + id + ') failed. Error: ' + job._error);
        });
      });

      kue.app.set('title', 'Jobs');
      app.use('/jobs', [ kue.app ]);
    });

    if (config.vehiclesService.initFleetOnStart) {
      logger.info('immediate refresh of vehicle list, and then scheduling hourly updates.');
      JobService.schedule('vehicle-reconcile-fleet', {}, '10 seconds', function(err) {
        if (err) return done(err);
        JobService.repeat('vehicle-reconcile-fleet', {}, '1 hour', done);
      })
    } else {
      logger.info('scheduling hourly updates of vehicle list.');
      JobService.repeat('vehicle-reconcile-fleet', {}, '1 hour', done);
    }
  }
};

exports['@require'] = [ 'services/job-service', 'policies/tokenPassThrough', 'policies/isAdmin', 'igloo/settings', 'igloo/logger' ];
