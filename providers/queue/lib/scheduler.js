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
let UUID       = require('uuid');

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

Scheduler.add = function add(job, options) {
  co(function *() {
    //
    // For unknown legacy reasons, there's ways of grouping
    // similar schedules on the same timer. Because we do not
    // have time to audit why this is, whether it's a feature
    // or a bug or what it will break, we are adding an optional
    // way to break out of this system without having to put
    // the burden of finding a unique identifier on the 
    // implementer each time.
    //
    if(options.unique) {
      options.uid = options.uid || UUID.v4();
    }

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
      //
      // We need to tidy up our database in a few ways. This
      // is one of them.
      //
      let expire = options.timer.value * {
        seconds:  1,
        minutes:  60,
        hours:    60 * 60, 
        days:     60 * 60 * 24
      }[options.timer.type];

      if(isNaN(expire)) {
        // if that totally fucking failed then
        // we just fall back on it being 2 days.
        expire = 60 * 60 * 24 * 2;
      }
      // we add an hour for good luck.
      expire += 3600;

      yield redis.set(SCHEDULES + job + uid, JSON.stringify({
        job     : job,
        timer   : timer.format(),
        options : options
      }));
      // and hopefully this helps us dump this later.
      yield redis.expire(SCHEDULES + job + uid, expire);
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

Scheduler.cancel = function cancel(job, uid) {
  return co(function *() {
    uid = uid ? ':' + uid : '';
    let jobString = SCHEDULES + job + uid;

    log.info(`Cancel [${ jobString }]`);

    // See if the redis key exists or 
    // if it has already been handled.
    let check = yield redis.get(jobString);
    yield redis.del(jobString);

    //
    // clearTimeout can't be used to check for validity:
    //
    // "Passing an invalid ID to clearTimeout() silently does nothing; no exception is thrown."
    // https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/clearTimeout
    //
    clearTimeout(Scheduler.store[job + uid]);

    return check;
  });
};

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
        .removeOnComplete( true )
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
