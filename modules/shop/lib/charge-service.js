'use strict';

let Service     = require('./classes/service');
let error       = Bento.Error;
let config      = Bento.config.shop;

// ### Charges Service

module.exports = class Charges extends Service {
  /**
   * Returns a charge based on provided id.
   * @param  {String} chargeId
   * @return {Object}
   */
  static *getCharge(chargeId) {
    let service = this.getService(config.service, 'charges');

    return yield service.show(chargeId);
  }
};
