'use strict';

let assert = require('chai').assert;
let name   = require('node-random-name');
let query  = require('../query');
let User   = Reach.model('User');

describe('MySQL Service [query.js]', function () {
  this.timeout(10000);

  describe('Query', function () {
    before(function *() {
      let notZero = 20;
      while (notZero) {
        let firstName = name({ first: true, random: Math.random });
        let lastName  = name({ last: true, random: Math.random });
        let email     = (firstName + '.' + lastName + '@test.none').toLowerCase();
        let user      = new User({
          firstName : firstName,
          lastName  : lastName,
          email     : email
        });
        yield user.preparePassword('password');
        yield user.save();
        notZero--;
      }
    });

    it('should fetch a list of users from the database', function *() {
      let users = yield query.ql({ User : {} });
      assert.isDefined(users);
      assert.isArray(users);
      assert.isAbove(users.length, 0);
    });
  });
});