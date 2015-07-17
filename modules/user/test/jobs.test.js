'use strict';

let assert = require('chai').assert;
let queue  = Reach.service('queue');

// ### Tests

describe('user-welcome', function () {
  it('should start the welcome proccess', function (done) {
    queue
      .createJob('user-welcome', {})
      .removeOnComplete(true)
      .save(function (err) {
        if (err) {
          return done(err);
        }
        done();
      });
  });
});

describe('user-change-email', function () {
  it('should start the change email proccess', function (done) {
    queue
      .createJob('user-change-email', {})
      .removeOnComplete(true)
      .save(function (err) {
        if (err) {
          return done(err);
        }
        done();
      });
  });
});

describe('user-change-password', function () {
  it('should start the change password proccess', function (done) {
    queue
      .createJob('user-change-password', {})
      .removeOnComplete(true)
      .save(function (err) {
        if (err) {
          return done(err);
        }
        done();
      });
  });
});