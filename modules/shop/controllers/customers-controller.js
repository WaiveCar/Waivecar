'use strict';

let service = require('../lib/customer-service');

Bento.Register.Controller('Shop/CustomersController', (controller) => {

  /**
   * Creates a new customer.
   * @return {Object}
   */
  controller.create = function *() {
    return yield service.create(this.payload, this.auth.user);
  };

  /**
   * Updates the customer data.
   * @param  {Number} id
   * @return {Object}
   */
  controller.update = function *(id) {
    return yield service.update(id, this.payload, this.auth.user);
  };

  /**
   * Deletes a customer.
   * @param  {Number} id
   * @return {Object}
   */
  controller.delete = function *(id) {
    return yield service.delete(id, this.query, this.auth.user);
  };

  return controller;

});
