'use strict';

import { api } from 'bento';

module.exports = class Stripe {
  
  /**
   * Checks if the user has a stripe id or requests one to be created.
   * @param {Object}   user
   * @param {Function} done
   */
  static ensureCustomer(user, done = () => {}) {
    if (!user.stripeId) {
      this.addCustomer(user, done);
    }
  }

  /**
   * Adds a new stripe customer.
   * @param {Object}   user
   * @param {Function} [done]
   */
  static addCustomer(user, done = () => {}) {
    api.post('/payments/customers', {
      userId   : user.id,
      service  : 'stripe',
      customer : {
        description : 'WaiveCar customer registered via web.'
      }
    }, function (err) {
      if (err) {
        console.log(err.message);
      }
    });
  }

  /**
   * Registers a new payment card under the provided user.
   * @param {Object}   user
   * @param {Object}   card
   * @param {Function} [done]
   */
  static addCard(user, card, done = () => {}) {
    if (!user.stripeId) {
      return alert('Missing stripeId, cannot add a card.');
    }
    api.post('/payments/cards', {
      userId  : user.id,
      service : 'stripe',
      card    : card
    }, function (err, card) {
      if (err) {
        return console.log(err.message);
      }
      done(card);
    });
  }

  /**
   * Returns a list of cards belonging to the authenticated user.
   * @param {Function} done
   */
  static getCards(done) {
    api.get('/payments/cards', function (err, cards) {
      if (err) {
        return console.log(err.message);
      }
      done(cards);
    });
  }

  /**
   * Deletes a payment card.
   * @param  {String}   cardId
   * @param  {Function} done
   */
  static deleteCard(cardId, done) {
    api.delete(`/payments/cards/${ cardId }`, done);
  }

}