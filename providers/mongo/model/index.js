'use strict';

let mongo = Bento.provider('mongo');
let type  = Bento.Helpers.Type;

module.exports = (name, getModel) => {

  let _model = getModel({});

  /**
   * Mongo collection handler.
   * @param {Object} data
   */
  function MongoCollection(data) {
    this._attributes = [];
    for (let key in data) {
      if (key === '_id' || key === 'id') {
        this.id = mongo.ObjectID(data[key]);
        this._attributes.push('id');
      } else {
        this[key] = data[key];
        this._attributes.push(key);
      }
    }
  }

  /**
   * Mongo collection.
   * @type {Object}
   */
  MongoCollection.prototype._collection = MongoCollection._collection = mongo.collection.bind(mongo, _model.id);

  /**
   * Data blacklist.
   * @type {Array}
   */
  MongoCollection.prototype._blacklist = MongoCollection._blacklist = _model.blacklist || [];

  // ### Static Methods

  MongoCollection.count    = require('./count');
  MongoCollection.find     = require('./find');
  MongoCollection.findOne  = require('./findOne');
  MongoCollection.findById = require('./findById');

  // ### Instance Methods

  MongoCollection.prototype.insert = require('./insert');
  MongoCollection.prototype.save   = require('./save');
  MongoCollection.prototype.update = require('./update');
  MongoCollection.prototype.remove = require('./remove');

  // ### Shared Methods

  /**
   * Returns a list of defined data values on the instanced model.
   * @method _data
   * @return {Object}
   */
  MongoCollection.prototype._data = function _data() {
    let result = {};
    this._attributes.forEach((key) => {
      result[key] = this[key];
    });
    return result;
  };

  /**
   * Returns a proper collection id.
   * @param  {Object} data
   * @return {Object}
   */
  MongoCollection.prototype.parseId = MongoCollection.parseId = (data) => {
    if (data && data.id) {
      data._id = mongo.ObjectID(data.id);
      delete data.id;
    }
    return data;
  };

  /**
   * @param  {Array} [filter]
   * @return {Object}
   */
  MongoCollection.prototype.toJSON = function toJSON(filter) {
    let attrs = this._attributes;
    let data  = {};

    // ### Attributes
    // Initially populate data object with the model attributes only.

    for (let i = 0, len = attrs.length; i < len; i++) {
      let key = attrs[i];
      if (this.hasOwnProperty(key)) {
        data[key] = this[key];
      }
    }

    // ### Blacklist
    // Remove any property on the data object that has been blacklisted.

    if (this._blacklist && this._blacklist.length) {
      for (let i = 0, len = this._blacklist.length; i < len; i++) {
        let key = this._blacklist[i];
        if (data.hasOwnProperty(key)) {
          delete data[key];
        }
      }
    }

    // ### Filter
    // Remove any attribute that is not apart of the provided filter.

    if (type.isArray(filter)) {
      for (let key in data) {
        if (filter.indexOf(key) === -1) {
          delete data[key];
        }
      }
    }

    return data;
  };

  return MongoCollection;

};
