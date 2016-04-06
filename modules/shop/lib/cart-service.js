'use strict';

let shortid   = require('shortid');
let sequelize = Bento.provider('sequelize');
let redis     = Bento.Redis;
let relay     = Bento.Relay;
let error     = Bento.Error;
let bucket    = redis.bucket('shop:carts');

// ### Models

let Cart = Bento.model('Shop/Cart');
let Item = Bento.model('Shop/Item');

// ### Constants

const CART_TIMER = 60 * 60 * 48; // Carts lives for 48 hours with no activity

// ### Car Service

module.exports = class CartService {

  /**
   * Creates a new cart.
   * @param  {Object}  payload Initial cart details.
   * @param  {Boolean} persist Remove cart timer, this value can only be set internaly.
   * @param  {Object}  [_user]
   * @return {Object}
   */
  static *create(payload, persist, _user) {
    let cartId = shortid();
    let userId = this.getUserId(payload.userId, _user);

    // ### Create Cart

    yield bucket.setJSON(cartId, {
      id     : cartId,
      userId : userId,
      items  : payload.items.map((item) => {
        return {
          id       : item.id,
          quantity : item.quantity
        };
      }),
      coupon : payload.coupon || null
    }, persist ? 0 : CART_TIMER);

    let cart = yield this.show(cartId, _user);

    this.relay('store', cart);

    return cart;
  }

  /**
   * createTimeCart
   * Creates a specific cart for time overrage
   *
   * @param {Number} minutes
   * @param {Number} total
   * @param {Object} user
   * @return {Object}
   */
  static *createTimeCart(minutes, total, user) {
    let cartId = shortid();
    let item = yield Item.findOne({ where : { name : 'Excess Time' } });
    yield bucket.setJSON(cartId, {
      id     : cartId,
      userId : user.id,
      items  : [
        {
          quantity : minutes / 60,
          id       : item.id,
          total    : total
        }
      ],
      coupon : null
    }, CART_TIMER);

    let cart = yield this.show(cartId, user);
    this.relay('store', cart);
    return cart;
  }

  /**
   * Returns a indexed array of carts belonging to the provided user.
   * @param  {Number} userId
   * @param  {Object} _user
   * @return {Array}
   */
  static *index(userId, _user) {
    if (userId !== _user.id && !_user.hasAccess('admin')) {
      throw error.parse({
        code    : `SHOP_CART_INVALID_CREDENTIALS`,
        message : `You do not have the required credentials to view the requested carts.`
      }, 401);
    }

    // ### Stored Carts
    // Get a list of stored carts.

    let carts = [];
    let saved = yield Cart.find({
      where : {
        userId : userId
      }
    });

    // ### Retrieve Carts
    // Retrieves the list of saved carts from the redis db.

    for (let i = 0, len = saved.length; i < len; i++) {
      let cart = yield this.show(saved[i].cartId);
      if (!cart) {
        yield bucket.del(saved[i].cartId);
        continue;
      }
      carts.push(cart);
    }

    return carts;
  }

  /**
   * Returns a single cart.
   * @param  {String} id
   * @return {Object}
   */
  static *show(id, _user) {
    let cart = yield this.getCart(id);
    this.hasAccess(cart, _user);
    cart.items = yield this.getItems(cart);
    return Object.assign(cart, {
      total : cart.items.reduce((prev, next) => {
        return prev + next.total;
      }, 0)
    });
  }

  /**
   * Saves a cart by storing it in the db and removing expiry timers.
   * @param  {String} id
   * @param  {Object} _user
   * @return {Object}
   */
  static *save(id, _user) {
    let cart = yield this.getCart(id);

    // ### Access Checks

    if (!cart.userId) {
      throw error.parse({
        code     : `SHOP_CART_NO_USER`,
        message  : `You must assign a user to the cart before saving it.`,
        solution : `Make sure you update the cart with an assigned user before performing a save operation.`
      }, 400);
    }

    if (cart.userId !== _user.id && !_user.hasAccess('admin')) {
      throw error.parse({
        code    : `SHOP_CART_INVALID_CREDENTIALS`,
        message : `You do not have the required credentials to save this cart.`
      }, 401);
    }

    // ### Save Cart

    let record = new Cart({
      cartId : cart.id,
      userId : cart.userId
    });
    yield record.save();

    // ### Update Bucket
    // Stores the new cart in the bucket.

    yield bucket.persist(id);
  }

  /**
   * Updates a cart.
   * @param  {Number} id
   * @param  {Object} payload
   * @param  {Boolean} perstist Remove cart timer, this value can only be set internaly.
   * @param  {Object} [_user]
   * @return {Object}
   */
  static *update(id, payload, persist, _user) {
    let stored = yield this.getCart(id);
    let userId = payload.userId ? this.getUserId(payload.userId, _user) : stored.userId;

    this.hasAccess(stored, _user);

    // ### Update Cart

    yield bucket.setJSON(id, {
      id     : stored.id,
      userId : userId,
      items  : payload.items.map((item) => {
        return {
          id          : item.id,
          quantity    : item.quantity,
          description : item.description,
          price       : item.price,
          name        : item.name
        };
      }),
      coupon : payload.coupon || null
    }, persist ? 0 : CART_TIMER);

    let cart = yield this.show(id, _user);

    this.relay('update', cart);

    return cart;
  }

  /**
   * Deletes a cart.
   * @param  {String} bucketId
   * @param  {Object} _user
   * @return {Object}
   */
  static *delete(id, _user) {
    let cart = yield Cart.findById(id);
    if (cart) {
      yield sequelize.query(`DELETE FROM shop_carts WHERE cart_id = '${ cart.id }'`);
    }
    yield bucket.del(id);
  }

  // ### Helpers

  /**
   * Returns the userId to assign to the cart if one is requested.
   * @param  {Object} userId
   * @param  {Object} _user
   * @return {Number}
   */
  static getUserId(userId, _user) {
    if (userId) {
      if (!_user || userId !== _user.id && !_user.hasAccess('admin')) {
        throw error.parse({
          code    : 'SHOP_CART_INVALID_ASSIGNMENT',
          message : `You cannot add this user to the cart.`,
          data    : {
            userId : userId
          }
        }, 400);
      }
      return userId;
    }
    return null;
  }

  /**
   * Retrieves a cart from the redis cart bucket.
   * @param  {String} id
   * @return {Object}
   */
  static *getCart(id) {
    let cart = yield bucket.getJSON(id);
    if (!cart) {
      throw error.parse({
        code    : `SHOP_CART_NOT_FOUND`,
        message : `The requested cart does not exist.`
      }, 404);
    }

    // ### Reset Timer
    // When a cart is being access we increase its lifetime.

    if (!cart.id) {
      yield bucket.expire(id, CART_TIMER);
    }

    return cart;
  }

  /**
   * Returns a list of cart items based on the provided array.
   * @param  {Object} cart
   * @return {Array}
   */
  static *getItems(cart) {
    let items  = cart.items || [];
    let result = [];
    for (let i = 0, len = items.length; i < len; i++) {
      let item = yield Item.findById(items[i].id);
      if (!item) {
        continue;
      }
      if (item.name === 'Miscellaneous') {
        let created = {
          id          : item.id,
          categoryId  : item.categoryId,
          number      : item.number,
          name        : item.name,
          price       : items[i].price,
          description : items[i].description
        };
        item = created;
      }

      result.push({
        id          : item.id,
        categoryId  : item.categoryId,
        number      : item.number,
        name        : item.name,
        price       : item.price,
        description : items[i].description,
        quantity    : items[i].quantity,
        total       : items[i].total || (items[i].quantity * item.price)
      });
    }
    return result;
  }

  /**
   * Relays cart accross the network.
   * @param  {Object} cart
   * @return {Void}
   */
  static relay(type, cart) {
    let payload = {
      type : type,
      data : cart
    };

    if (cart.userId) {
      relay.user(cart.userId, 'carts', payload);
    }

    if (cart.public) {
      relay.emit('carts', payload);
    } else {
      relay.admin('carts', payload);
    }
  }

  /**
   * Throws access error if request is not allowed to access the cart.
   * @param  {Object}  cart
   * @param  {Object}  _user
   * @return {Boolean}
   */
  static hasAccess(cart, _user) {
    if (!cart.userId) {
      return; // Cart is public (registered by a guest visitor)
    }
    if (!_user || cart.userId !== _user.id && !_user.hasAccess('admin')) {
      throw error.parse({
        code    : `SHOP_CART_INVALID_CREDENTIALS`,
        message : `You do not have access to this cart.`
      }, 401);
    }
  }

};
