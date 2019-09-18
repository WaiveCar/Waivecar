'use strict';

let EmailService = require('./index');
let config       = Bento.config;
let error        = Bento.Error;
let log          = Bento.Log;

module.exports = function *() {
  if (Bento.isTesting()) {
    return log.info(' - When testing, configuration is handled by the unit tests.');
  }

  if (!config.email || !config.email.transport || !config.email.templateFolder) {
    throw error.parse({
      code     : 'EMAIL_BAD_CONFIG',
      message  : 'Your Email configuration is invalid',
      solution : 'Make sure you set up your config in the [./config/' + Bento.ENV + '] folder'
    });
  } else {
    log.info(' - Email configuration passed!');
  }
};
