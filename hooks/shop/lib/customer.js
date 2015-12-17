'use strict';

module.exports = class Customer {

  /**
   * Customer service payload filter.
   * @param  {Object} customer
   * @return {Object}
   */
  static filter(payload) {
    return {
      description  : payload.description,
      subscription : payload.subscription,
      metadata     : payload.metadata
    };
  }

};
