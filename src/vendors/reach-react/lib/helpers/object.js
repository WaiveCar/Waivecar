'use strict';

/**
 * @class Objects
 */
let Objects = module.exports = {};

/** 
 * @method clone
 * @type   {Object} obj
 * @return {Array}
 */
Objects.clone = function (obj) {
  let clone = {};
  for (let i in obj) {
    clone[i] = obj[i];
  }
  return clone;
};