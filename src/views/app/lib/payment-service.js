'use strict';

import { api, auth, dom } from 'bento';
import Service            from './component-service';

module.exports = class Payment extends Service {

  /**
   * Stores the provided context.
   * @param {Object} ctx
   */
  constructor(ctx) {
    super(ctx, 'payment', {
      cards : []
    });
    this.submitCard = this.submitCard.bind(this);
    this.deleteCard = this.deleteCard.bind(this);
  }

  // ### Payment Customers

  /**
   * Ensuers a customer has been created with the stripe service to
   * allow for actions against the payment sevice.
   * @param {Object} user
   */
  ensureCustomer(user) {
    if (!user.stripeId) {
      this.addCustomer(user);
    }
  }

  /**
   * Registers the user with stripe via the api.
   * @param {Object}  user         The user to register with stripe.
   * @param {Boolean} shouldNotify
   */
  addCustomer(user, shouldNotify) {
    api.post('/payments/customers', {
      userId   : user.id,
      service  : 'stripe',
      customer : {
        description : 'WaiveCar customer registered via web.'
      }
    }, (err, res) => {
      if (err) {
        console.log(err);
        return this.error(err.message);
      }

      // ### Update User
      // If the authenticated user is being registered we update the localy
      // stored auth.user

      if (auth.user.id === user.id) {
        auth.put({ stripeId : res.stripeId });
      }

      // ### Notify
      // If true we throw a snackbar notification of a successfull registration.

      if (shouldNotify) {
        this.success(`Account was successfully registered with payment service.`);
      }
    });
  }

  // ### Payment Cards

  /**
   * Form submission method for bento-web form component.
   * @param  {Object}   data
   * @param  {Function} reset
   */
  submitCard(data, reset) {
    this.addCard(auth.user(), data, (card) => {
      this.setState('cards', [
        ...this.getState('cards'),
        card
      ]);
      this.success(`Your new payment card was added successfully`);
      reset();
    });
  }

  /**
   * Adds a new payment card under the provided user.
   * @param {Object}   user
   * @param {Object}   card
   * @param {Function} done
   */
  addCard(user, card, done) {
    if (!user.stripeId) {
      return snackbar.notify({
        type    : `danger`,
        message : `You are not yet registered with a payment service.`
      });
    }
    api.post('/payments/cards', {
      userId  : user.id,
      service : 'stripe',
      card    : card
    }, (err, card) => {
      if (err) {
        return this.error(err.message);
      }
      done(card);
    });
  }

  /**
   * Loads cards from the api and adds them to the cards array on the ctx.
   */
  setCards() {
    api.get('/payments/cards', (err, cards) => {
      if (err) {
        return this.error(err.message);
      }
      this.setState('cards', cards);
    });
  }

  /**
   * Deletes a card and updates the cards array on the ctx.
   * @param {String} cardId
   */
  deleteCard(cardId) {

    // ### Hide Button
    // If a delete button has been defined we hide the button while processing
    // the delete request.

    let btn = this.getRefs(`delete-card-${ cardId }`);
    if (btn) {
      btn.className = dom.setClass({ hide : true });
    }

    // ### Submit Request

    api.delete(`/payments/cards/${ cardId }`, (err) => {
      if (err) {
        if (btn) {
          btn.className = dom.setClass({
            hide : false
          });
        }
        return this.error(err.message);
      }

      // ### Update State
      // Updates the payment cards state.

      this.setState('cards', function () {
        let cards  = this.getState('cards');
        let result = [];
        cards.forEach((card) => {
          if (card.id !== cardId) {
            result.push(card);
          }
        });
        return result;
      }.call(this));

      // ### Notify
      // Notify client of successfull card removal.

      this.success(`Your payment card was successfully removed from your account`);
    });

  }

}
