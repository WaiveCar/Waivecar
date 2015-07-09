/**
  MySQL Model
  ===========

  Stability: 3 - Stable

  @author  Christoffer Rødvik
  @license MIT
 */

'use strict';

let changeCase = require('change-case');

// ### Export Module

module.exports = (function () {

  /**
   * @class MySQL
   * @constructor
   */
  function MySQL(data) {
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
  MySQL.prototype._blacklist = [];

  /**
   * Collects all the data belonging to the model and returns it as
   * a key => value object.
   * @method _data
   * @return {Object} data
   */
  MySQL.prototype._data = function () {
    let attrs = this._schema.attributes;
    let data  = {};
    for (let key in attrs) {
      data[key] = this[key];
    }
    data.createdAt = this.createdAt;
    data.updatedAt = this.updatedAt;
    data.deletedAt = this.deletedAt;
    return data;
  };

  /**
   * @method toJSON
   * @param  {Array} attributes
   * @return {Object}
   */
  MySQL.prototype.toJSON = function (attributes) {
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

  return MySQL;

})();