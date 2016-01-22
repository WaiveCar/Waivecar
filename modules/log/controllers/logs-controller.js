'use strict';

let service = require('../lib/log-service');

Bento.Register.Controller('LogsController', (controller) => {

  /**
   * Log an error that occurs in a 3rd party service.
   * @param  {String} type The type of log we are creating.
   * @return {Object}
   */
  controller.create = function *(type) {
    return yield service.create(type, this.payload);
  };

  /**
   * Returns an index array of results.
   * @param  {String} type The type of log we are indexing.
   * @return {Array}
   */
  controller.index = function *(type) {
    return yield service.index(type, this.query);
  };

  /**
   * Returns a single log object based on provided type and id.
   * @param {String} type
   * @param {Number} id
   */
  controller.show = function *(type, id) {
    return yield service.getLog(type, id);
  };

  /**
   * Updates a log.
   * @param  {String} type
   * @param  {Number} id
   * @return {Object}
   */
  controller.update = function *(type, id) {
    return yield service.update(type, id, this.payload);
  };

  /**
   * Sets a log to resolved state.
   * @param  {String} type The type of log to resolve.
   * @param  {Number} id
   * @return {Object}
   */
  controller.resolve = function *(type, id) {
    return yield service.resolve(type, id);
  };

  return controller;

});
