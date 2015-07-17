'use strict';

let assert  = require('chai').assert;
let request = require('co-request').defaults({ json : true, headers : { 'content-type' : 'application/json' } });
let config  = Reach.config;

describe('POST /logger', function () {
  it('should log a new error', function *() {
    let res = yield request.post(config.api.uri + '/logger', {
      body : {
        errorStatus   : 500,
        detailCode    : 'WEB_API_BROKE',
        detailMessage : 'The action performed during web api errored out',
        detailData    : {
            sample : 'Some sample data for this error'
        }
      }
    });
    assert.equal(res.statusCode, 204);
  });
});

describe('GET /logger', function () {
  it('should return a list of errors', function *() {
    let res  = yield request(config.api.uri + '/logger');
    let body = res.body;
    assert.equal(res.statusCode, 200);
    assert.isArray(body);
    assert.isAbove(body.length, 0);
  });
});