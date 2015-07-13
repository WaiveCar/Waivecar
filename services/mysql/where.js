/*
  Where
  =====

  Stability: 3 - Stable

  Takes a list of values that can be produced into where statements and creates a where object.

  @author  Christoffer Rødvik
  @license MIT
 */

'use strict';

module.exports = function (query, options) {
  let result = {};
  for (let key in options) {
    if (query.hasOwnProperty(key)) {
      result[key] = prepareOptions(query[key], options[key]);
    }
  }
  return result;
};

/**
 * @private
 * @method prepareOptions
 * @param  {String} value
 * @param  {Mixed}  options
 * @return {Object}
 */
function prepareOptions(value, options) {
  if ('object' !== typeof options) {
    if ('string' === typeof options) {
      let val = options.replace('?', value);
      return isNumeric(value) ? parseFloat(val) : val;
    }
    return options;
  }
  let result = {};
  if (Object === options.constructor) {
    for (let key in options) {
      result[key] = prepareOptions(value, options[key]);
    }
  }
  return result;
}

/**
 * @private
 * @method isNumberic
 * @param  {Mixed} n
 * @return {Boolean}
 */
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}