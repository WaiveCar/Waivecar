'use strict';

let co         = require('co');
let moment     = require('moment');
let wrapper    = require('co-redis');
let queue      = require('./client');
let changeCase = Bento.Helpers.Case;
let config     = Bento.config;
let log        = Bento.Log;
let error      = Bento.Error;
let SCHEDULES  = changeCase.toParam(config.api.name) + ':schedules:';
let redis      = getRedis();

// ### Schedules

let Scheduler = module.exports = (job) => {
  co(function *() {
    let schedules = yield redis.keys(SCHEDULES + job + '*');
    for (let i = 0, len = schedules.length; i < len; i++) {
      let schedule = yield redis.get(schedules[i]);
      if (schedule) {
        schedule = JSON.parse(schedule);
        Scheduler.add(schedule.job, schedule.options);
      }
    }
  });
};

/**
 * @property store
 * @type     Object
 * @default  {}
 */
Scheduler.store = {};

/**
 * Adds a new job schedule.
 * @param  {String} job
 * @param  {Object} options
 * @return {Void}
 */
Scheduler.add = function add(job, options) {
  co(function *() {
    let uid      = options.uid ? ':' + options.uid : '';
    let schedule = yield redis.get(SCHEDULES + job + uid);
    let timer    = null;
    if (schedule) {
      schedule = JSON.parse(schedule);
      options  = options || schedule.options;
      timer    = moment(schedule.timer);
    } else {
      if (options.init) {
        timer = moment().utc();
      } else {
        timer = moment().utc().add(options.timer.value, options.timer.type);
      }
      yield redis.set(SCHEDULES + job + uid, JSON.stringify({
        job     : job,
        timer   : timer.format(),
        options : options
      }));
    }
    if (options.init) {
      delete options.init;
    }
    addJob(job, options, timer);
  });
};

/**
 * Processes a job.
 * @param  {String}   jobId
 * @param  {Function} handler
 * @return {Void}
 */
Scheduler.process = function process(jobId, handler) {
  queue.process(jobId, (job, done) => {
    co(function *() {
      try {
        yield handler(job);
        done();
      } catch (err) {
        log.error({
          code     : err.code || 'QUEUE_PROCESSING_ERROR',
          message  : err.toString(),
          solution : `Correct any issues with code found in the '${ jobId }' job.`,
          stack    : err.stack || null
        });
      }
    });
  });
};

/**
 * Cancels a scheduled job.
 * @param  {String} job
 * @return {Void} [description]
 */
Scheduler.cancel = function cancel(job, uid) {
  co(function *() {
    uid = uid ? ':' + uid : '';
    log.info(`Cancel [${ SCHEDULES + job + uid }]`);
    yield redis.del(SCHEDULES + job + uid);
    clearTimeout(Scheduler.store[job + uid]);
  });
};

/**
 * @param  {String} job
 * @param  {Object} options
 * @param  {Moment} time
 * @return {Void}
 */
function addJob(job, options, time) {
  let uid     = options.uid ? ':' + options.uid : '';
  let trigger = getScheduleTrigger(job, time, options.silent);
  Scheduler.store[job + uid] = setTimeout(() => {
    co(function *() {
      if(uid) {
        let isset = yield redis.exists(SCHEDULES + job + uid);
        if(!isset) {
          return false;
        }
      }

      let task = queue
        .create(job, options.data || {})
        .save((err) => {
          if (err) {
            return log.error(err);
          }
        })
      ;
      yield redis.del(SCHEDULES + job + uid);
      task.on('complete', () => {
        task.remove();
        if (options.repeat) {
          Scheduler.add(job, options);
        }
      });
    });
  }, trigger || 0);
}

/**
 * @param  {String}  job
 * @param  {Moment}  time
 * @param  {Boolean} isSilent
 * @return {Int}     trigger
 */
function getScheduleTrigger(job, time, isSilent) {
  let now     = moment().utc();
  let trigger = time.diff(now);
  let seconds = Math.ceil(trigger / 1000);
  if (!isSilent) {
    if (seconds <= 0) {
      log.info(`Setting [${ job }] job to run now`);
    } else if (seconds < 60) {
      log.info(`Setting [${ job }] job to run in ${ seconds } seconds`);
    } else {
      log.info(`Setting [${ job }] job to run ${ time.fromNow() }`);
    }
  }
  return trigger;
}

/**
 * Returns a co wrapped redis client.
 * @return {Object}
 */
function getRedis() {
  let client = null;
  if (Bento.config.queue && Bento.config.queue.redis) {
    let port = Bento.config.queue.redis.port;
    let host = Bento.config.queue.redis.host;
    client = require('redis').createClient(port, host, Bento.config.queue.redis);
  } else {
    client = require('redis').createClient();
  }
  return wrapper(client);
}
