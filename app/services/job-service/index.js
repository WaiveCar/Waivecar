/*jshint loopfunc: true */
var path = require('path');
var kue = require('kue');
var queue = null;
var glob = require('glob');
var _ = require('lodash');
var async = require('async');

exports = module.exports = function(IoC, config, logger) {
  var svc = {

    getQueue: function() {
      if (queue !== null) {
        return queue;
      }

      queue = kue.createQueue({
        prefix: config.jobs.kue.prefix,
        redis: {
          port: config.jobs.kue.redis.port,
          host: config.jobs.kue.redis.host
        }
      });

      queue.on('error', function(err) {
        logger.error('Kue failed');
        logger.error(err);
      });

      return queue;
    },

    enqueue: function(type, data, next, priority, attempts, delay) {
      var job = svc.getQueue().create(type, data);

      if (delay) {
        job.delay(delay);
      }

      job.priority(priority || 'normal');

      attempts = attempts || 3;
      if (attempts) {
        job.attempts(attempts).backoff({ delay: (30 + Math.floor(Math.random() * 60)) * 1000, type: 'fixed' });
      }

      job.save(function (err) {
        if (err) {
          logger.error('Failed to save queue job! Is redis up? Job Type:', job.type);
        }

        if (next) {
          next();
        }
      });
    },

    setupHandlers: function(next) {
      svc.getQueue();
      glob(path.resolve(__dirname, './handlers/') + '/*.js', function(err, files) {
        if (err) return next(err);
        logger.info('starting Job Service Handlers');
        async.each(files, function(file, nextFile) {
          var identity = path.basename(file, '.js');
          var handler = IoC.create('handlers/' + identity);
          logger.debug('started Job Service Handler: %s with %sx concurrency', identity, handler.concurrency);
          queue.process(identity, handler.concurrency, handler.process);
          return nextFile();
        }, next);
      });
    }
  };

  return svc;
};

exports['@singleton'] = true;
exports['@require'] = [ '$container', 'igloo/settings', 'igloo/logger' ];
