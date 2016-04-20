'use strict';

let assert       = require('chai').assert;
let EmailService = Bento.provider('email');
let config       = Bento.config.email;
let mockEmail    = {
  template : 'default',
  context  : {
    name    : 'user',
    company : 'Acme'
  },
  from    : 'sender@waivecar.com',
  to      : 'receiver@example.com',
  subject : 'Hello',
  html    : '<p>How are you?</p>'
};

describe.only('Email Service', function() {
  this.timeout(30000);

  if (config && config.transport && config.templateFolder && config.transportName === 'mandrill') {
    let service = new EmailService();

    describe('Send', () => {
      it('should send an email with valid params', function *() {
        let result = yield service.send(mockEmail);
        assert.isDefined(result);
        assert.isDefined(result.messageId);
        assert.isDefined(result.accepted);
        assert.equal(result.accepted[0].status, 'sent');
      });
    });

  } else {
    it('does not have a valid configuration to test against', done => { done(); });
  }
});
