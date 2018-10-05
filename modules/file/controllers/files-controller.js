'use strict';

let service = require('../lib/file-service');

Bento.Register.Controller('FilesController', (controller) => {

  controller.store = function *() {
    return yield service.store(this.query, this.payload, this.auth.user);
  };

  controller.index = function *() {
    return yield service.index(this.query, this.auth.user);
  };

  /**
   * Returns a file model based on provided id.
   * @param  {String} id
   * @return {Object}
   */
  controller.meta = function *(id) {
    return yield service.getFile(id, this.auth.user);
  };

  controller.show = function *(id) {
    return yield service.show(this, id, this.auth.user);
  };

  /**
   * Deletes a file from the record and its physical location.
   * @param  {String} id
   * @return {Object}
   */
  controller.delete = function *(id) {
    return yield service.delete(id, this.query, this.auth.user);
  };

  return controller;

});
