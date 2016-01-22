'use strict';

let stripe = require('../stripe');
let error  = Bento.Error;

// ### Models

let User  = Bento.model('User');
let Order = Bento.model('Shop/Order');

module.exports = class Service {

  /**
   * Retrieves an order by the provided id.
   * @param  {Number} id
   * @return {Object}
   */
  static *getOrder(id) {
    let order = yield Order.findById(id);
    if (!order) {
      throw error.parse({
        code    : `SHOP_INVALID_ORDER`,
        message : `The requested order does not exist.`,
        data    : {
          id : id
        }
      }, 404);
    }
    return order;
  }

  /**
   * Attempts to return the user with the provided id or throws an error.
   * @param  {Number} userId
   * @return {Object}
   */
  static *getUser(userId) {
    let user = yield User.findById(userId);
    if (!user) {
      throw error.parse({
        code    : `SHOP_INVALID_USER`,
        message : `Could not find the user attached to the shop request.`
      }, 400);
    }
    return user;
  }

  /**
   * Attempts to retrieve the requested payment service.
   * @param  {String} service The service identifier.
   * @param  {String} type    The service category to return.
   * @return {Object}         Returns the payment service customer instance.
   */
  static getService(service, type) {
    let result = null;

    // ### Load Service
    // Assign the requested service to the service variable, if the
    // service does not exist we throw an error informing the user
    // of the issue.

    switch (service) {
      case 'stripe' : {
        result = stripe[type];
        break;
      }
    }

    if (!result) {
      throw error.parse({
        code    : `SHOP_INVALID_SERVICE`,
        message : `${ service }.${ type } is not a valid service handler.`
      }, 400);
    }

    return result;
  }

  /**
   * Only allow access if the requesting user is the actor or is administrator.
   * @param  {Object}  user  The user to be modified.
   * @param  {Object}  _user The user requesting modification.
   * @return {Boolean}
   */
  static hasAccess(user, _user) {
    if (user.id !== _user.id && _user.hasAccess('admin')) {
      throw error.parse({
        error   : `SHOP_INVALID_CREDENTIALS`,
        message : `You do not have access to this shop request.`
      }, 400);
    }
  }

};
