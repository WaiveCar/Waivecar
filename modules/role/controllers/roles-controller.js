'use strict';

let service = require('../lib/role-service');

Bento.Register.Controller('Role/RolesController', function(controller) {

  /**
   * Returns a list of roles.
   * @return {Object}
   */
  controller.index = function *() {
    return yield service.index();
  };

  /**
   * Returns a list of roles defined under provided group.
   * @param  {Number} id
   * @return {Array}
   */
  controller.groupIndex = function *(id) {
    return yield service.groupIndex(id, this.auth.user);
  };

  return controller;

});
