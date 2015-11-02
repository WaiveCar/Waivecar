'use strict';

var assert = require('chai').assert;

describe('Interface', function () {
  describe('User', function () {
    var User = Bento.model('User');
    var user = null;

    it('has been defined', function (done) {
      assert.isDefined(User, 'User is not defined');
      assert.isFunction(User, 'User is not a function');
      done();
    });

    it('can create a new user', function *() {
      user = new User({
        firstName : 'John',
        lastName  : 'Interface',
        email     : 'john.interface@test.none'
      });
      yield user.save();
      assert.isNumber(user.id, 'User was not assigned an id');
    });
  });
});