'use strict';

/**
 * @class Fields
 * @param {Object} fields
 */
let Fields = module.exports = {};

/**
 * List of form fields.
 * @property store
 * @type     Object
 */
Fields.store = {};

/**
 * @method addFields
 * @param  {Object} fields
 */
Fields.addFields = function (fields) {
  for (let key in fields) {
    this.store[key] = fields[key];
  }
};

/**
 * @method get
 * @param  {String} key
 */
Fields.get = function (key) {
  return this.store[key];
};