'use strict';

let Service = require('../lib/ui-service');

Bento.Register.Controller('UiController', (controller) => {

  /**
   * @return {Array}
   */
  controller.index = function *() {
    return yield Service.getAll(this.auth.user);
  };

  return controller;

});
