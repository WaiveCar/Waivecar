'use strict';

let assert      = require('chai').assert;
let AuthService = require('../lib/auth-service');
let bcrypt      = Bento.provider('bcrypt');
let User        = Bento.model('User');
let GroupUser   = Bento.model('GroupUser');

describe('Auth Module', () => {

  // ### Test User
  // Create a test user that we throw against the service.

  before(function *() {

    let user = new User({
      firstName : 'John',
      lastName  : 'Doe',
      email     : 'john.auth@test.none',
      password  : yield bcrypt.hash('password', 10)
    });
    yield user.save();

    let group = new GroupUser({
      groupId : 1,
      userId  : user.id,
      roleId  : 5
    });
    yield group.save();

  });

  // ### Auth Service

  describe('Login', () => {

    it('should login and return a token', function *() {
      let res = yield AuthService.login({
        identifier : 'john.auth@test.none',
        password   : 'password'
      });
      assert.isObject(res, 'Login did not return with a response object');
      assert.isNotNull(res.token, 'Login token was empty');
    });

    it('should throw an error on invalid credentials', function *() {
      let error = null;
      try {
        yield AuthService.login({
          identifier : 'john.auth@test.none',
          password   : 'passwoids'
        });
      } catch (err) {
        error = err;
      }
      assert.isNotNull(error, 'Did not throw error on invalid credentials');
      assert.equal(error.status, 400, 'Did not respond with correct status');
    });

    it('should throw an error on invalid group', function *() {
      let error = null;
      try {
        yield AuthService.login({
          identifier : 'john.auth@test.none',
          password   : 'password',
          group      : 2
        });
      } catch (err) {
        error = err;
      }
      assert.isNotNull(error, 'Did not throw error on invalid group');
      assert.equal(error.status, 400, 'Did not respond with correct status');
    });

  });

});
