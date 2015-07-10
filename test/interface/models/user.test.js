/*
  Auth Module Tests
  =================
  @author Christoffer Rødvik
  @github https://github.com/kodemon/reach-api
 */

'use strict';

var assert = require('chai').assert;

describe('Interface', function () {
  describe('User', function () {
    var User = Reach.model('User');
    var user = null;

    it('has been defined', function (done) {
      assert.isDefined(User, 'User is not defined');
      assert.isFunction(User, 'User is not a function');
      done();
    });

    it('can create a new user', function *() {
      user = new User({
        firstName : 'John',
        lastName  : 'Doe',
        email     : 'john.doe@test.none'
      });

      yield user.preparePassword('password');
      yield user.save();

      assert.isNumber(user.id, 'User was not assigned an id');
    });
  });
});