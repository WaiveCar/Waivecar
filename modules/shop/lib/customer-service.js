'use strict';

let Service   = require('./classes/service');
let sequelize = Bento.provider('sequelize');
let User      = Bento.model('User');
let error     = Bento.Error;
let hooks     = Bento.Hooks;
let config    = Bento.config.shop;

// ### Customer Service

module.exports = class Customers extends Service {

  /**
   * Attempts to create a new stripe user with the requested user id.
   * @param  {Object} payload Contains the userId, service and customer data.
   * @param  {Object} _user   The authenticated user making the registration request.
   * @return {Object}         Returns with the registered user.
   */
  static *create(payload, _user) {
    let customer, data;
    let service = this.getService(config.service, 'customers');
    if (!payload.isOrganization) {
      customer = yield this.getUser(payload.userId);
      data = yield hooks.require('shop:store:customer:before', payload.customer, _user);
      this.hasAccess(user, _user);
    } else {
      let Organization = Bento.model('Organization');  
      customer = yield Organization.findById(payload.userId);
      customer.firstName = customer.name;
      customer.email = payload.email;
    }
    return yield service.create(customer, data);
  }

  /**
   * Attempts to update the customer payload with the payment service.
   * @param  {Number} id
   * @param  {Object} payload Contains the service and customer payload.
   * @param  {Object} _user   The authenticated user making the request.
   * @return {Object}
   */
  static *update(id, payload, _user) {
    let user    = yield this.getUser(id);
    let service = this.getService(config.service, 'customers');
    let data    = yield hooks.require('shop:update:customer:before', payload, _user);

    this.hasAccess(user, _user);

    return yield service.update(user, data);
  }

  /**
   * Attempts to remove a customer from the payment service.
   * @param  {Number} userId
   * @param  {Object} query
   * @param  {Object} _user
   * @return {Object}
   */
  static *delete(userId, query, _user) {
    let user    = yield this.getUser(userId);
    let service = this.getService(query.service, 'customers');

    this.hasAccess(user, _user);

    // ### Delete Cards
    // Delete all credit cards that has been registered under the user.

    yield sequelize.query('UPDATE payment_cards SET deleted_at = NOW() WHERE user_id = ?', {
      type         : sequelize.QueryTypes.UPDATE,
      replacements : [ userId ]
    });

    // ### Delete Service
    // Delete the user from the service.

    yield service.delete(user);
  }

};
