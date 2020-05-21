'use strict';

let error = Bento.Error;

module.exports = class StripeCustomers {

  constructor(service) {
    this.stripe = service;
  }

  /**
   * Creates a new customer with the provided user data.
   * @param  {Object} user The user model to register.
   * @param  {Object} data The data to submit with the customer registration.
   * @return {Object}
   */
  *create(user, data) {
    if (user.stripeId) {
      throw error.parse({
        code     : `CUSTOMER_EXISTS`,
        message  : `The provided user is already a stripe customer`,
        solution : `Delete the stripe customer before attempting to create a new one`
      }, 400);
    }

    // ### Submit
    // Submit the registration request of a new customer to stripe.

    let customer = yield new Promise((resolve, reject)  => {
      this.stripe.customers.create(this.prepareData(user, data), (err, customer)  => {
        if (err) {
          return reject(err);
        }
        resolve(customer);
      });
    });

    // ### Update User
    // Updates the user data with the id returned from stripe.

    yield user.update({
      stripeId : customer.id
    });
    return user;
    
  }

  /**
   * Sends a data update request on behalf of the provided user.
   * @param  {Object} user The user to make the request for.
   * @param  {Object} data Data to submit to stripe.
   * @return {Object}
   */
  *update(user, data) {
    this.verifyStripeId(user);

    // ### Update
    // Send the update request to stripe.

    yield new Promise((resolve, reject) => {
      this.stripe.customers.update(user.stripeId, this.prepareData(user, data), (err, customer) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });

    return user;
  }

  /**
   * Submits a request to delete a customer from the stripe service.
   * @param  {Object} user The user to make the delete request for.
   * @return {Object}      Returns the user with a nullified stripeId.
   */
  *delete(user) {
    this.verifyStripeId(user);

    // ### Delete
    // Send delete request of customer to stripe.

    yield new Promise((resolve, reject) => {
      this.stripe.customers.del(user.stripeId, (err, customer) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });

    yield user.update({
      stripeId : null
    });

    return user;
  }

  /**
   * Prepares customer data.
   * @param  {Object} user
   * @param  {Objcet} data
   * @return {Object}
   */
  prepareData(user, data = {}) {
    let metaData = Object.assign({
      id        : user.id,
      firstName : user.firstName,
      lastName  : user.lastName
    }, data.metadata || {});

    // ### Assign Data
    // Assigns the user email, and meta data to the data object.

    return Object.assign(data, {
      email    : user.email,
      metadata : Object.assign(metaData, {
        id        : user.id,
        firstName : user.firstName,
        lastName  : user.lastName
      })
    });
  }

  /**
   * Checks if the provided user has a stripe id or throws an error.
   * @param  {Object} user
   */
  verifyStripeId(user) {
    if (!user.stripeId) {
      throw error.parse({
        code     : `INVALID_CUSTOMER`,
        message  : `The provided user is not a stripe customer`,
        solution : `Create a new stripe customer for the user`
      }, 400);
    }
  }

};
