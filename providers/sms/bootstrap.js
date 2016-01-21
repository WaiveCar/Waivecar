'use strict';

let SmsService = require('./index');
let config     = Bento.config;
let error      = Bento.Error;
let log        = Bento.Log;

module.exports = function *() {
  if (Bento.isTesting()) {
    return log.info(' - When testing, configuration is handled by the unit tests.');
  }

  if (!config.sms || !config.sms.transport || !config.sms.transportName) {
    throw error.parse({
      code     : 'SMS_BAD_CONFIG',
      message  : 'Your SMS configuration is invalid',
      solution : 'Make sure you set up your config in the [./config/' + Bento.ENV + '] folder'
    });
  } else {
    log.info(' - SMS configuration passed!');
  }

  if (config.sms.transportName !== 'twilio') {
    throw error.parse({
      code     : 'SMS_BAD_CONFIG',
      message  : 'Your SMS configuration is invalid',
      solution : 'Only twilio is available at present'
    });
  } else {
    log.info(' - Transport configuration passed!');
  }

};
