'use strict';

let User       = Bento.model('User');
let Card       = Bento.model('Shop/Card');
let error      = Bento.Error;
let changeCase = Bento.Helpers.Case;
let stripe     = null;
let UserLog    = require('../../../log/lib/log-service');

module.exports = class StripeCards {

  constructor(service) {
    this.stripe = service;
  }

  /**
   * Registers a new credit card with the stripe service.
   * @param  {Object} user User to assign the credit card under.
   * @param  {Object} card The card information.
   * @return {Object}      Returns the api representation of the card.
   */
  *create(user, card) {
    // This just checks for a property on the user object existing
    // and throws an error if it doesn't ... probably a bad way
    // of doing things since that error gets hidden by a secondary
    // error catcher higher up but that's the way it goes.
    this.verifyStripeId(user);

    // ### Register Card

    let result = yield new Promise((resolve, reject) => {
      this.stripe.customers.createCard(user.stripeId, { card : changeCase.objectKeys('toSnake', card) }, (err, res) => {
        if (err) return reject(err);

        // No debit cars (#1305) and no pre-paid (no ticket found actually)
        // There's a *fourth* type of card, 'unknown' ... for our sakes
        // we're just going to let pass thru to avoid issues.
        if ((res.funding === 'debit' && !(yield user.hasTag('debit'))) || res.funding === 'prepaid') {
          yield UserLog.addUserEvent(user, 'DEBIT', `${res.funding} ${res.last4}`);

          // The debit card must also be deleted from stripe to prevent it from being used by accident
          this.stripe.customers.deleteCard(user.stripeId, res.id, (err, response) => {
            if (err) {
              return reject(error.parse({
                code    : 'DEBIT_CARD',
                message : 'Error deleting debit card.'
              }, 400));
            }
          });
          return reject(error.parse({
            code    : 'DEBIT_CARD',
            message : 'Please use a non-prepaid and non-debit credit card.'
          }, 400));
        }
        resolve(res);
      });
    });

    // ### Local Storage
    // Store quick view information about the card in the api database.

    card        = new Card(result);
    card.userId = user.id;
    card.type   = result.funding;
    card.name   = result.name;

    yield card.save();

    return card;
  }

  /**
   * Returns a card that has been registered with the stripe service.
   * @param  {String} stripeId
   * @param  {String} cardId
   * @return {Object}
   */
  *show(stripeId, cardId) {
    return yield new Promise((resolve, reject) => {
      this.stripe.customers.retrieveCard(stripeId, cardId, (err, card) => {
        if (err) {
          return reject(err);
        }
        resolve(card);
      });
    });
  }

  /**
   * Updates the customers card with the stripe service.
   * @param  {String} stripeId
   * @param  {String} cardId
   * @param  {Object} data
   * @return {Object}
   */
  *update(stripeId, cardId, data) {
    return yield new Promise((resolve, reject) => {
      this.stripe.customers.updateCard(stripeId, cardId, changeCase.objectKeys('toSnake', data), (err, card) => {
        if (err) {
          return reject(err);
        }
        resolve(card);
      });
    });
  }

  // Deletes a card from the stripe service.
  *delete(stripeId, cardId) {
    let card = yield Card.findById(cardId);
    if (card) {
      yield card.delete();
    } else {
      console.warn("Couldn't find a card with the id of " + cardId);
    }
      
    yield new Promise((resolve, reject) => {
      this.stripe.customers.deleteCard(stripeId, cardId, (err, confirmation) => {
        if (err) {
          console.warn("Couldn't delete card from stripe", err);
          // We aren't going to return this issue to the user ... instead we just drop it in the error above
          // return reject(err);
        }
        resolve();
      });
    });
  }

  // ### HELPER METHODS

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
