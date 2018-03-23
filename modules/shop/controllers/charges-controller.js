'use strict';

let service = require('../lib/charge-service');
let error   = Bento.Error;

Bento.Register.Controller('Shop/ChargesController', (controller) => {

  /**
   * Returns a shop item.
   * @param  {Number} id
   * @return {Object}
   */
  controller.show = function *(id) {
    return yield service.getCharge(id, this.auth.user);
  };

  return controller;

});
