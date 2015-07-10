'use strict';

let changeCase = require('change-case');
let moment     = require('moment');
let query      = Reach.service('mysql/query');

module.exports = (function () {

  /**
   * @class MySQLModel
   * @constructor
   */
  function MySQLModel(data) {
    let self       = this;
    let attributes = Object.keys(this._schema.attributes);

    data = changeKeyCase(data) || {};

    attributes.forEach(function (key) {
      if (data.hasOwnProperty(key)) {
        self[key] = data[key];
      } else {
        self[key] = null;
      }
    });

    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
    this.deletedAt = data.deletedAt || null;
  }

  /**
   * A list of whitelisted columns that can be return with .toJSON()
   * @property _blacklist
   * @type     Array
   * @default  []
   */
  MySQLModel.prototype._blacklist = [];

  /**
   * Performs a insert query on the model.
   * @method insert
   * @return {Object} result
   */
  MySQLModel.prototype.save = function *() {
    if (!this._table) { throw missingTableError(); }

    let result = yield query.insert(this._table, this._data());

    this.id        = result.insertId;
    this.createdAt = moment().format('YYYY-MM-DD HH-mm-ss');

    return result;
  };

  /**
   * Performs a select query on the model.
   * @method select
   */
  MySQLModel.find = function *(options) {
    if (!this._table) { throw missingTableError(); }

    let result = yield query.select(this._table, options);
    let Model  = this;

    if (!result) {
      return result;
    }

    if (options && options.limit && 1 === options.limit) {
      return new Model(result);
    }

    result.forEach(function (user, index) {
      result[index] = new Model(user);
    });

    return result;
  };

  /**
   * Performs a update query on the model.
   * @method update
   * @param  {Object} data
   * @return {Object}
   */
  MySQLModel.prototype.update = function *(data) {
    if (!this._table) { throw missingTableError(); }

    let result = yield query('UPDATE '+ this._table +' SET ?, updated_at = NOW() WHERE id = ?', [data, this.id]);
    for (var key in data) {
      if (this.hasOwnProperty(key)) {
        this[key] = data[key];
      }
    }
    this.updatedAt = moment().format('YYYY-MM-DD HH-mm-ss');
    return result;
  };

  /**
   * Performs a soft delete on the model.
   * @method delete
   * @return {Object}
   */
  MySQLModel.prototype.delete = function *() {
    if (!this._table) { throw missingTableError(); }

    return yield query('UPDATE ' + this._table + ' SET deleted_at = NOW() WHERE id = ?', [this.id]);
  };

  /**
   * Collects all the data belonging to the model and returns it as
   * a key => value object.
   * @method _data
   * @return {Object} data
   */
  MySQLModel.prototype._data = function () {
    let attrs = this._schema.attributes;
    let data  = {};
    for (let key in attrs) {
      data[key] = this[key];
    }
    if (data.createdAt) { data.createdAt = this.createdAt; }
    if (data.updatedAt) { data.updatedAt = this.updatedAt; }
    if (data.deletedAt) { data.deletedAt = this.deletedAt; }
    return data;
  };

  /**
   * @method toJSON
   * @param  {Array} attributes
   * @return {Object}
   */
  MySQLModel.prototype.toJSON = function (attributes) {
    let result = this._data();

    // ### Remove Blacklist Keys

    if (this._blacklist.length) {
      this._blacklist.forEach(function (key) {
        if (result.hasOwnProperty(key)) {
          delete result[key];
        }
      });
    }

    // ### Keep Attributes
    // If attributes has been provided then we remove keys
    // that are not present in the attribute list.

    if (attributes && Array === attributes.constructor) {
      for (let key in result) {
        if (-1 === attributes.indexOf(key)) {
          delete result[key];
        }
      }
    }

    return result;
  };

  /**
   * Create a new error object for missing _table parameter.
   * @private
   * @method missingTableError
   * @return {Error}
   */
  function missingTableError() {
    let err = new Error('Missing _table parameter on MySQL model');
    err.code = 'MYSQL_SERVICE_MISSING_ATTRIBUTE';
    return err;
  }

  /**
   * Converts keys in an object from camelCase to snake_case
   * @private
   * @method changeKeyCase
   * @param  {object} obj
   * @return {object}
   */
  function changeKeyCase(obj) {
    let converted = {};
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        let newKey = key;
        if (-1 === key.indexOf('.')) {
          newKey = changeCase.camelCase(key);
        }
        converted[newKey] = obj[key];
      }
    }
    return converted;
  }

  return MySQLModel;

})();