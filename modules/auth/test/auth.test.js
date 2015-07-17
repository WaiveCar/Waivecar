'use strict';

let User = Reach.model('User');

describe('Auth Module', function () {
  before(function *() {
    let user = new User({
      firstName : 'John',
      lastName  : 'Doe',
      email     : 'john.doe@test.none'
    });
    yield user.preparePassword('password');
    yield user.save();
  });

  // ### Routes
  // Test against auth module routes

  describe('Routes', function () {
    require('./routes.test.js');
  });
});