var kue = require('kue');
var cluster = require('cluster');

exports = module.exports = function(JobService, tokenPassThrough, isAdmin, config, logger) {
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

      queue.promote();
      kue.app.set('title', 'Jobs');
      app.use('/jobs', [ kue.app ]);
    });
  }
};

exports['@require'] = [ 'services/job-service', 'policies/tokenPassThrough', 'policies/isAdmin', 'igloo/settings', 'igloo/logger' ];
