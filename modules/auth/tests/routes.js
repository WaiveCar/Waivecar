'use strict';

let assert  = require('chai').assert;
let request = require('co-request').defaults({ json : true, headers : { 'content-type' : 'application/json' } });
let config  = Bento.config;
let _user   = null;

describe('POST /auth/login', () => {
  it('should successfully login', function *() {
    let res = yield request.post(config.api.uri + '/auth/login', {
      body : {
        identifier : 'john.auth@test.none',
        password   : 'password'
      }
    });
    let body = res.body;
    assert.equal(res.statusCode, 200, body.message);
    assert.isObject(body, 'Response is not of type object!');
    assert.isDefined(body.token, 'Missing authorization token!');
    _user = body;
  });

  it('should fail with wrong credentials', function *() {
    let res = yield request.post(config.api.uri + '/auth/login', {
      body : {
        identifier : 'john.auth@test.none',
        password   : 'invalid.password'
      }
    });
    assert.equal(res.statusCode, 400);
  });
});

describe('GET /auth/remember', () => {
  it('should remember a token permanently', function *() {
    let res = yield request(config.api.uri + '/auth/remember', {
      headers : {
        Authorization : _user.token
      }
    });
    assert.equal(res.statusCode, 200);
  });
});

describe('GET /auth/validate', () => {
  it('should validate auth token', function *() {
    let res = yield request(config.api.uri + '/auth/validate', {
      headers : {
        Authorization : _user.token
      }
    });
    assert.equal(res.statusCode, 200);
  });
});

describe('GET /auth/logout', () => {
  it('should invalidate the active token', function *() {
    let res = yield request(config.api.uri + '/auth/logout', {
      headers : {
        Authorization : _user.token
      }
    });
    assert.equal(res.statusCode, 200);
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
