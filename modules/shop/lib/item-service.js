'use strict';

let sequelize   = Bento.provider('sequelize');
let queryParser = Bento.provider('sequelize/helpers').query;
let Item        = Bento.model('Shop/Item');
let error       = Bento.Error;

// ### Items Service

module.exports = class Items {

  /**
   * Registers a new item with the shop.
   * @param  {Object} payload
   * @param  {Object} _user
   * @return {Object}
   */
  static *create(payload, _user) {
    this.hasAccess(_user);

    let item = new Item(payload);
    yield item.save();

    return item;
  }

  /**
   * Returns an index list of the items registered in the shop.
   * @param  {Object} query
   * @param  {Object} _user
   * @return {Array}
   */
  static *index(query, _user) {
    return yield Item.find(queryParser(query, {
      where : {
        number : queryParser.STRING,
        name   : queryParser.LIKE,
        price  : queryParser.BETWEEN
      }
    }));
  }

  /**
   * Returns a single item record.
   * @param  {Number} id
   * @param  {Object} _user
   * @return {Object}
   */
  static *show(id, _user) {
    return yield this.getItem(id);
  }

  /**
   * Updates a item registered with the shop.
   * @param  {Number} id
   * @param  {Object} payload
   * @param  {Object} _user
   * @return {Object}
   */
  static *update(id, payload, _user) {
    this.hasAccess(_user);

    let item = yield this.getItem(id);

    yield item.update(payload);

    return item;
  }

  /**
   * Deletes a item registered with the shop.
   * @param  {Number} id
   * @param  {Object} _user
   * @return {Object}
   */
  static *delete(id, _user) {
    this.hasAccess(_user);

    let item = yield this.getItem(id);

    yield item.delete();
  }

  /**
   * Attempts to retrieve an item from the shop database.
   * @param  {Number} id
   * @return {Object}
   */
  static *getItem(id) {
    let item = yield Item.findById(id);
    if (!item) {
      throw error.parse({
        code    : `SHOP_ITEM_NOT_FOUND`,
        message : `The requested item does not exist.`,
        data    : {
          id : id
        }
      }, 404);
    }
    return item;
  }

  /**
   * Has access performs an admin check on the user and throw an authentication
   * error if the user is not.
   * @param  {Object} _user
   * @return {Void}
   */
  static *hasAccess(_user) {
    if (_user.role !== 'admin') {
      throw error.parse({
        code    : `SHOP_INVALID_CREDENTIALS`,
        message : `You do not have the required credentials to create a new item.`
      }, 401);
    }
  }

};
