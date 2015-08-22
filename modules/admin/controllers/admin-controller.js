'use strict';

let AdminService = require('../lib/admin-service');

Reach.Register.Controller('AdminController', function (controller) {

  /**
   * @method ui
   * @return {Void}
   */
  controller.ui = function *() {
    return yield AdminService.ui(this.auth.user);
  };

  return controller;

});