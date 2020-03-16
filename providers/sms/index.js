'use strict';

let error = Bento.Error;
module.exports = class SMS {

  /**
   * Sets up the configuration and internal transporter.
   * @return {Void}
   */
  constructor() {
    this.config = Bento.config.sms;
    try {
      this.transporter = require(this.config.transportName)(this.config.transport.sid, this.config.transport.token);
    } catch(err) {
      this.transporter = null;
    }
  }

  /**
   * Send an sms
   * @param {Object}   sms
   * @yield {Function}
   */
  *send(sms) {
    if (!sms.to || !sms.message) {
      throw error.parse({
        code     : 'SMS_BAD_PARAM',
        message  : 'Invalid SMS: A To and Message are required',
        solution : 'Ensure SMS has a To and Message'
      }, 400);
    }

    if (!this.transporter) {
      throw error.parse({
        code     : 'SMS_BAD_CONFIG',
        message  : 'Invalid Transport',
        solution : 'Add a valid Transport in to SMS configuration'
      }, 400);
    }

    let data = {
      to   : sms.to,
      from : this.config.transport.phoneNumber,
      body : sms.message
    };

    return yield (done) => {
      this.transporter.sendMessage(data, done);
    };
  }

};
