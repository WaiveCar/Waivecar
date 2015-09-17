'use strict';

/**
 * @class Fields
 * @param {Object} fields
 */
let Fields = module.exports = function (list) {
  Fields.list = list;
};

/**
 * List of form fields.
 * @property list
 * @type     Object
 */
Fields.list = {};

/**
 * @method set
 * @param  {Object} field
 */
Fields.set = function (field) {
  Fields.list = Object.assign(Field.list, { field });
};

/**
 * @method get
 * @param  {String} key
 */
Fields.get = function (key) {
  return Fields.list[key];
};