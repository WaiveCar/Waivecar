'use strict';

let service = require('../lib/card-service');

Bento.Register.Controller('Shop/CardsController', (controller) => {

  /**
   * Attempts to register a new credit card with the requested payment service.
   * @return {Object}
   */
  controller.create = function *() {
    return yield service.create(this.payload, this.auth.user);
  };

  /**
   * List cards registered with the requested payment serivce.
   * @return {Array}
   */
  controller.index = function *() {
    return yield service.index(this.query, this.auth.user);
  };

  /**
   * Shows a card based on the provided cardId
   * @param  {String} id
   * @return {Object}
   */
  controller.show = function *(id) {
    return yield service.show(id, this.auth.user);
  };

  /**
   * Updates a card.
   * @param {String} id
   * @return {Object}
   */
  controller.update = function *(id) {
    return yield service.update(id, this.payload, this.auth.user);
  };

  /**
   * Deletes a card.
   * @param {String} id
   * @return {Object}
   */
  controller.delete = function *(id) {
    return yield service.delete(id, this.auth.user);
  };

  return controller;

});
