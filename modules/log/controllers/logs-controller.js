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

  controller.stats = function *(type) {
    return yield service.stats(type);
  };
  
  controller.report = function *(year_month, type) {
    return yield service.report(year_month, type, this.query);
  };

  controller.index = function *(type) {
    return yield service.index(type, this.query);
  };

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
