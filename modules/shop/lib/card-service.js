'use strict';

let Service     = require('./classes/service');
let queryParser = Bento.provider('sequelize/helpers').query;
let User        = Bento.model('User');
let Card        = Bento.model('Shop/Card');
let error       = Bento.Error;
let config      = Bento.config.shop;

// ### Cards Service

module.exports = class Cards extends Service {

  /**
   * Creates a new card with the request payment service.
   * @param  {Object} data  Contains the userId, service and card details.
   * @param  {Object} _user The authenticated user making the registration request.
   * @return {Object}       Returns a api record of the card.
   */
  static *create(data, _user) {
    let user    = yield this.getUser(data.userId);
    let service = this.getService(config.service, 'cards');

    this.hasAccess(user, _user);

    // Credit card must match either first or last name #476
    //
    // This should exist above the stripe lib.
    // A little bit of sanitization will be done beforehand.
    //
    // The CC name that comes in is a single unit with spaces.
    let hasMatch = false;

    if(data.card.name) {
      let cardNameParts = data.card.name.toLowerCase().split(/\s+/);
      let userNameParts = [user.firstName, user.lastName].join(' ').toLowerCase().split(/\s+/);

      userNameParts.forEach(function(name) {
        hasMatch |= ( (name.length && cardNameParts.indexOf(name)) !== -1 );
      });
    }

    if (!hasMatch) {
      throw error.parse({
        code    : 'NAME_ON_CARD',
        message : 'The name on the credit card must be close to the one on the account.'
      }, 400);
    }

    
    let card = false;
    try {
      card = yield service.create(user, data.card);
    } catch (ex) {
      throw error.parse(ex, 400);
    }
    return card;

  }

  /**
   * Return a list of cards registered with the api.
   * @param  {Object} query
   * @param  {String} role
   * @param  {Object} _user
   * @return {Array}
   */
  static *index(query, _user) {
    query = queryParser(query, {
      where : {
        userId   : queryParser.NUMBER,
        last4    : queryParser.STRING,
        brand    : queryParser.STRING,
        expMonth : queryParser.NUMBER,
        expYear  : queryParser.YEAR
      }
    });

    // ### Admin Query

    if (_user.hasAccess('admin')) {
      return yield Card.find(query);
    }

    // ### User Query

    query.where.userId = _user.id;
    return yield Card.find(query);
  }

  /**
   * Returns a registered card based on the provided cardId.
   * @param  {String} cardId
   * @param  {Object} _user  The authenticated user making the request.
   * @return {Object}
   */
  static *show(cardId, _user) {
    let card    = yield this.getCard(cardId);
    let user    = yield this.getUser(card.userId);
    let service = this.getService(config.service, 'cards');

    this.hasAccess(user, _user);

    return yield service.show(user.stripeId, cardId);
  }

  static *update(cardId, data, _user) {
    let card    = yield this.getCard(cardId);
    let user    = yield this.getUser(card.userId);
    let service = this.getService(config.service, 'cards');

    // ### Ensure Access
    // We need to make sure that the request is made by authorized parties.

    this.hasAccess(user, _user);

    // ### Request Update

    let result = yield service.update(user.stripeId, cardId, data);
    yield card.update({
      expMonth : result.exp_month || card.expMonth,
      expYear  : result.exp_year  || card.expYear
    });
    return card;
  }

  // Deletes a card from the customer records.
  static *delete(cardId, _user) {
    let card    = yield this.getCard(cardId);
    let user    = yield this.getUser(card.userId);
    let service = this.getService(config.service, 'cards');

    this.hasAccess(user, _user);

    let cards = yield Card.find({ where : { userId : user.id } });
    if (!_user.isAdmin() && cards.length <= 1) {
      throw error.parse({
        code    : 'CARD_COUNT',
        message : 'User must maintain one active card'
      }, 400);
    }

    yield service.delete(user.stripeId, cardId);
    yield card.delete();
  }

  /**
   * Returns a card based on provided id.
   * @param  {String} cardId
   * @return {Object}
   */
  static *getCard(cardId) {
    let card = yield Card.findById(cardId);
    if (!card) {
      throw error.parse({
        code    : `CARD_NOT_FOUND`,
        message : `The card requested has been removed or does not exist.`
      }, 400);
    }
    return card;
  }

};
