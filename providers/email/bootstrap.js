'use strict';

let EmailService = require('./index');
let config       = Bento.config;
let error        = Bento.Error;
let log          = Bento.Log;

module.exports = function *() {
  if (Bento.isTesting()) {
    return log.info(' - When testing, configuration is handled by the unit tests.');
  }
};
