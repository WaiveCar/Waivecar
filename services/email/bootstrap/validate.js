'use strict';

let EmailService = require('../index');
let config         = Reach.config;
let errorHandler   = Reach.ErrorHandler;

module.exports = function *() {

  if (!config.email || !config.email.transport || !config.email.templateFolder) {
    errorHandler.log('error', 'EMAIL ERROR', {
      code     : 'EMAIL_BAD_CONFIG',
      message  : 'Your Email configuration is invalid',
      solution : 'Make sure you set up your config in the [./config/' + Reach.ENV + '] folder'
    });
    process.exit(1);
  }

  if (config.email.transportName !== 'mandrill') {
    errorHandler.log('error', 'EMAIL ERROR', {
      code     : 'EMAIL_BAD_CONFIG',
      message  : 'Your Email configuration is invalid',
      solution : 'Only mandrill is available at present'
    });
    process.exit(1);
  }

};