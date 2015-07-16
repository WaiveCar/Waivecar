/*
  Email Service Tests
  =================
  @author Matt Ginty
 */

'use strict';

// ### Dependencies

let assert         = require('chai').assert;
let EmailService   = Reach.service('email');

// ### Mocks

let mockEmail = {
  template : 'default',
  context  : {
    name    : 'user',
    company : 'Acme'
  },
  from     : 'sender@example.com',
  to       : 'matt.ginty@gmail.com',
  subject  : 'Hello',
  html     : '<p>How are you?</p>'
};

// ### Unit Tests

describe('Email Service', function () {
  this.timeout(30000);
  let service = new EmailService();

  describe('Send', function () {
    it('should send an email with valid params', function *() {
      let result = yield service.send(mockEmail);
      assert.isDefined(result);
      assert.isDefined(result.messageId);
      assert.isDefined(result.accepted);
      assert.equal(result.accepted[0].status, 'sent');
    });
  });

});
