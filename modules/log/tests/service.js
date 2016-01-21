'use strict';

let assert  = require('chai').assert;
let service = require('../lib/log-service');

describe('Service', () => {

  // ### Error Log

  it('should log error events', function *() {
    yield service.error({
      code     : `SAMPLE_ERROR`,
      message  : `This is a simple sample error`,
      solution : `This is a possible solution to this problem`,
      data     : {
        extra : `Here is some extra information`
      },
      stack : `I am a stackless error!`
    });
  });

  // ### Event Log

  it('should log an event', function *() {
    yield service.event({
      type  : `SAMPLE_EVENT`,
      value : `A sample event occured, and we are logging it with the API.`
    });
  });

});
