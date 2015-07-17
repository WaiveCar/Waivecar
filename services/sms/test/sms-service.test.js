'use strict';

let assert     = require('chai').assert;
let SmsService = Reach.service('sms');
let mock       = {
  number  : '+61430099449',
  message : 'Keep smiling.'
};

describe('Sms Service', function () {
  this.timeout(30000);
  let service = new SmsService();

  describe('Send', function () {
    it('should fail with unknown transporter', function *() {
      Reach.config.sms.transportName = 'acmeSms';
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
          number  :  mock.number
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
});
