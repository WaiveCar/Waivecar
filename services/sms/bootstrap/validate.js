'use strict';

let SmsService   = require('../index');
let config       = Reach.config;
let errorHandler = Reach.ErrorHandler;

module.exports = function *() {

  if (!config.sms || !config.sms.transport || !config.sms.transportName) {
    errorHandler.log('error', 'SMS ERROR', {
      code     : 'SMS_BAD_CONFIG',
      message  : 'Your SMS configuration is invalid',
      solution : 'Make sure you set up your config in the [./config/' + Reach.ENV + '] folder'
    });
    process.exit(1);
  }

  if (config.sms.transportName !== 'twilio') {
    errorHandler.log('error', 'SMS ERROR', {
      code     : 'SMS_BAD_CONFIG',
      message  : 'Your SMS configuration is invalid',
      solution : 'Only twilio is available at present'
    });
    process.exit(1);
  }

};