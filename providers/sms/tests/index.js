'use strict';

let assert     = require('chai').assert;
let SmsService = Bento.provider('sms');
let config     = Bento.config.sms;
let mock       = {
  to      : '+15005550006',
  message : 'Keep smiling.'
};

describe('Sms Service', function SMSService() {
  this.timeout(30000);

  if (config && config.transport && config.transportName && config.transportName === 'twilio') {
    let service = new SmsService();

    describe('Send', () => {
      it('should fail with unknown transporter', function *() {
        Bento.config.sms.transportName = 'acmeSms';
        let serviceWithInvalidTransport = new SmsService();
        try {
          let result = yield serviceWithInvalidTransport.send(mock);
        } catch (err) {
          assert.isDefined(err);
          assert.equal(err.code, 'SMS_BAD_CONFIG');
        }
      });

      it('should send an sms with valid params', function *() {
        let result = yield service.send(mock);
        assert.isDefined(result);
        assert.isDefined(result.sid);
      });

      it('should fail on non existant number', function *() {
        try {
          let result = yield service.send({
            message : 'Invalid Number'
          });
        } catch(err) {
          assert.isDefined(err);
          assert.equal(err.code, 'SMS_BAD_PARAM');
        }
      });

      it('should fail on non existant message', function *() {
        try {
          let result = yield service.send({
            number : mock.number
          });
        } catch(err) {
          assert.isDefined(err);
          assert.equal(err.code, 'SMS_BAD_PARAM');
        }
      });

      it ('should fail on invalid number', function *() {
        try {
          let result = yield service.send({
            number  : '+15005550001',
            message : 'Invalid Number'
          });
        } catch(err) {
          assert.isDefined(err);
        }
      });

      it ('should fail on non-routeable number', function *() {
        try {
          let result = yield service.send({
            number  : '+15005550002',
            message : 'non-routeable number'
          });
        } catch(err) {
          assert.isDefined(err);
        }
      });

      it ('should fail on blacklisted number number', function *() {
        try {
          let result = yield service.send({
            number  : '+15005550004',
            message : 'blacklisted number'
          });
        } catch(err) {
          assert.isDefined(err);
        }
      });

      it ('should fail on non sms-capable number', function *() {
        try {
          let result = yield service.send({
            number  : '+15005550009',
            message : 'non sms-capable number'
          });
        } catch(err) {
          assert.isDefined(err);
        }
      });
    });
  } else {
    it('does not have a valid configuration to test against', done => { done(); });
  }
});
