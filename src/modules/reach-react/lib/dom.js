'use strict';

import { type } from 'reach-react/lib/helpers';

/**
 * @class DOM
 */
let DOM = module.exports = {};

/**
 * @method hasClass
 * @param  {String} classes
 * @param  {String} className
 * @return {Boolean}
 */
DOM.hasClass = function (classes, className) {
  return classes.match(new RegExp(className, 'g'));
};

/**
 * @method setClass
 * @param  {Object} options
 * @return {String}
 */
DOM.setClass = function (options) {
  let result = [];
  for (let key in options) {
    let name = options[key];
    if (type.isBoolean(name) && name) {
      result.push(key);
    } else if (type.isString(name)) {
      result.push(name);
    }
  }
  return result.join(' ');
};