'use strict';

let assert  = require('chai').assert;
let request = require('co-request').defaults({ json : true, headers : { 'content-type' : 'application/json' } });
let config  = Reach.config;
let _user   = null;

before(function *() {
  let res = yield request.post(config.api.uri + '/auth/login', {
    body : {
      email    : 'john.doe@test.none',
      password : 'password'
    }
  });
  let body = res.body;
  assert.isDefined(body.id);
  _user = body;
});

after(function *() {
  yield request(config.api.uri + '/auth/logout', {
    headers : {
      Authorization : _user.token
    }
  });
});

// ### POST /users
// Tests that attempts to create new users via the module routes

describe('POST /users', function () {
  let url = config.api.uri + '/users';

  it('should report missing required fields', function *() {
    let res  = yield request.post(url);
    let body = res.body;
    assert.equal(res.statusCode, 400, body.message);
    assert.equal(body.message, 'The fields [firstName, lastName, email, password] is missing', body.message);
    assert.isArray(body.data.params, 'Params is not of type array');
    assert.lengthOf(body.data.params, 4, 'Array has length of ' + body.data.params.length);
  });

  it('should create a new user', function *() {
    let res = yield request.post(url, {
      body : {
        firstName : 'John',
        lastName  : 'Appleseed',
        email     : 'john.appleseed@test.none',
        password  : 'password'
      }
    });
    assert.equal(res.statusCode, 200);
  });

  it('should report error if email is in use', function *() {
    let res = yield request.post(url, {
      body : {
        firstName : 'John',
        lastName  : 'Appleseed',
        email     : 'john.appleseed@test.none',
        password  : 'password'
      }
    });
    let body = res.body;
    assert.equal(res.statusCode, 400, body.message);
    assert.equal(body.code, 'ER_DUP_ENTRY', body.code);
  });
});

// ### GET /users
// Tests that attempts to require a list of users via the module routes

describe('GET /users', function () {
  let url = config.api.uri + '/users';

  it('should return a list of users', function *() {
    let res  = yield request(url);
    let body = res.body;
    assert.equal(res.statusCode, 200);
    assert.isArray(body);
    assert.isAbove(body.length, 0);
  });
});

// ### GET /users/me
// Tests that attempts to require the profile object of the authenticated user

describe('GET /users/me', function () {
  let url = config.api.uri + '/users/me';

  it('should retrieve the authenticated users profile', function *() {
    let res = yield request(url, {
      headers : {
        Authorization : _user.token
      }
    });
    let body = res.body;
    assert.equal(res.statusCode, 200, body.message);
    assert.isObject(body, 'Response is not of type object!');
    assert.equal(body.id, _user.id);
    assert.isUndefined(body.token, 'Token should not be included!');
  });

  it('should 401 when invalid Authorization', function *() {
    let res = yield request(url, {
      headers : {
        Authorization : 'invalid.auth.token'
      }
    });
    let body = res.body;
    assert.equal(res.statusCode, 401, body.message);
    assert.isObject(body, 'Response is not of type object!');
    assert.equal(body.code, 'AUTH_INVALID_TOKEN', body.code);
  });

  it('should 401 when missing Authorization', function *() {
    let res  = yield request(url);
    let body = res.body;
    assert.equal(res.statusCode, 401, body.message);
    assert.isObject(body, 'Response is not of type object!');
    assert.equal(body.code, 'AUTH_ERROR', body.code);
  });
});

// ### GET /users/:id
// Tests that attempt to fetch a user object base on provided id

describe('GET /users/:id', function () {
  it('should return with a user of the provided id', function *() {
    let res  = yield request(config.api.uri + '/users/1');
    let body = res.body;
    assert.equal(res.statusCode, 200, body.message);
    assert.isObject(body, 'Response is not of type object!');
    assert.equal(body.id, 1);
  });

  it('should 404 when user not found', function *() {
    let res  = yield request(config.api.uri + '/users/1000');
    let body = res.body;
    assert.equal(res.statusCode, 404, body.message);
    assert.isObject(body, 'Response is not of type object!');
    assert.equal(body.code, 'USER_NOT_FOUND');
  });

});

// ### PUT /users/:id
// Tests that attempt to update users based on provided id

describe('PUT /users/:id', function () {
  it('should update user data', function *() {
    let res = yield request.put(config.api.uri + '/users/' + _user.id, {
      headers : {
        Authorization : _user.token
      },
      body : {
        firstName : 'Jack'
      }
    });
    assert.equal(res.statusCode, 200);
  });

  it('should 401 when invalid Authorization', function *() {
    let res = yield request.put(config.api.uri + '/users/' + _user.id, {
      headers : {
        Authorization : 'invalid.auth.token'
      },
      body : {
        firstName : 'Jack'
      }
    });
    let body = res.body;
    assert.equal(res.statusCode, 401, body.message);
    assert.isObject(body, 'Response is not of type object!');
    assert.equal(body.code, 'AUTH_INVALID_TOKEN', body.code);
  });

  it('should 401 when missing Authorization', function *() {
    let res = yield request.put(config.api.uri + '/users/' + _user.id, {
      body : {
        firstName : 'Jack'
      }
    });
    let body = res.body;
    assert.equal(res.statusCode, 401, body.message);
    assert.isObject(body, 'Response is not of type object!');
    assert.equal(body.code, 'AUTH_ERROR', body.code);
  });
});

// ### DELETE /users/:id
// Tests that attempt to delete a user based on provided id

describe('DELETE /users/:id', function () {
  it('should delete a user', function *() {
    let res = yield request.del(config.api.uri + '/users/' + _user.id, {
      headers : {
        Authorization : _user.token
      }
    });
    assert.equal(res.statusCode, 200);
  });

  it('should not find user after delete', function *() {
    let res  = yield request(config.api.uri + '/users/' + _user.id);
    let body = res.body;
    assert.equal(res.statusCode, 404, body.message);
    assert.isObject(body, 'Response is not of type object!');
    assert.equal(body.code, 'USER_NOT_FOUND', body.code);
  });
});
