'use strict';

let assert  = require('chai').assert;
let request = require('co-request').defaults({ json : true, headers : { 'content-type' : 'application/json' } });
let config  = Reach.config;
let _user   = null;

describe('POST /auth/login', function () {
  it('should successfully login', function *() {
    let res = yield request.post(config.api.uri + '/auth/login', {
      body : {
        email    : 'john.doe@test.none',
        password : 'password'
      }
    });
    let body = res.body;
    assert.equal(res.statusCode, 200, body.message);
    assert.isObject(body, 'Response is not of type object!');
    assert.isDefined(body.token, 'Missing authorization token!');
    _user = body;
  });

  it('should fail with wrong credentials', function *() {
    let res = yield request.post(config.api.uri + '/auth/login' ,{
      body : {
        email    : 'john.doe@test.none',
        password : 'invalid.password'
      }
    });
    assert.equal(res.statusCode, 401);
  });
});

describe('GET /auth/remember', function () {
  it('should remember a token permanently', function *() {
    let res = yield request(config.api.uri + '/auth/remember', {
      headers : {
        Authorization : _user.token
      }
    });
    assert.equal(res.statusCode, 204);
  });
});

describe('GET /auth/validate', function () {
  it('should validate auth token', function *() {
    let res = yield request(config.api.uri + '/auth/validate', {
      headers : {
        Authorization : _user.token
      }
    });
    assert.equal(res.statusCode, 204);
  });
});

describe('GET /auth/logout', function () {
  it('should invalidate the active token', function *() {
    let res = yield request(config.api.uri + '/auth/logout', {
      headers : {
        Authorization : _user.token
      }
    });
    assert.equal(res.statusCode, 204);
  });

  it('should fail on remember', function *() {
    let res = yield request(config.api.uri + '/auth/validate', {
      headers : {
        Authorization : _user.token
      }
    });
    assert.equal(res.statusCode, 401);
  });

  it('should fail on logout', function *() {
    let res = yield request(config.api.uri + '/auth/logout', {
      headers : {
        Authorization : _user.token
      }
    });
    assert.equal(res.statusCode, 401);
  });
});