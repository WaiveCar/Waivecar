'use strict';

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
    if (options[key]) {
      result.push(key);
    }
  }
  return result.join(' ');
};