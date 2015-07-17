/**
  SMS
  ========
  @author  Matt Ginty (c) 2015
  @license MIT
 */

'use strict';

// ### Module

module.exports = (function () {

  /**
   * @class Sms
   */
  function Sms() {
    this.config      = Reach.config.sms;
    this.transporter = require(this.config.transportName)(this.config.transport.sid, this.config.transport.token);
  }

  /**
   * Sends an SMS
   * @method send
   * @param {obejct} sms
   */
  Sms.prototype.send = function *(sms) {
    let self = this;

    if (!sms.number || !sms.message) {
      throw error.parse({
        code: 'SMS_BAD_PARAM',
        message: 'Invalid SMS: A Number and Message are required',
        solution: 'Ensure SMS has a Number and Message'
      }, 400);
    }

    if (!self.transporter) {
      throw error.parse({
        code: 'SMS_BAD_CONFIG',
        message: 'Invalid Transport',
        solution: 'Add a valid Transport in to SMS configuration'
      }, 400);
    }

    let data = {
      to   : sms.number,
      from : self.config.transport.phoneNumber,
      body : sms.message
    };

    return yield function(done) {
      self.transporter.sendMessage(data, done);
    }
  };

  return Sms;

})();
