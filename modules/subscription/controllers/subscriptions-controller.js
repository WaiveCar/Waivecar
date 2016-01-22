'use strict';

let service = require('../lib/subscription-service');

Bento.Register.Controller('SubscriptionsController', (controller) => {

  /**
   * @return {Object}
   */
  controller.store = function *() {
    return yield service.store(this.payload);
  };

  return controller;

});
