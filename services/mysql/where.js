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
  var result = {};
  var valid  = false;
  for (var key in query) {
    if (-1 !== options.indexOf(key)) {
      valid = true;
      result[key] = query[key];
    }
  }
  if (valid) {
    return result;
  }
  return null;
};