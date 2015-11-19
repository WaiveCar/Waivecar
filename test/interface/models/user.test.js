'use strict';

let assert = require('chai').assert;

describe('Interface', function test() {
  describe('User', function test() {
    let User = Bento.model('User');
    let user = null;

    it('has been defined', function test(done) {
      assert.isDefined(User, 'User is not defined');
      assert.isFunction(User, 'User is not a function');
      done();
    });

    it('can create a new user', function *test() {
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
