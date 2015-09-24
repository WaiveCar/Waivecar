'use strict';

/**
 * @class Helpers
 * @static
 */
let Helpers = module.exports = {};

let lastId = 0;

/**
 * @method nextId
 * @return {String}
 */
Helpers.nextId = function(prefix='id') {
  lastId++;
  return `${prefix}${lastId}`;
}

/**
 * @property Case
 * @type     Object
 */
Helpers.Case = require('./change-case/case');

/**
 * @property Random
 * @type     Object
 */
Helpers.Random = require('./random');

/**
 * @method parseStack
 * @param  {String} stack
 * @return {Array}
 */
Helpers.parseStack = (stack) => {
  var result = [];
  stack = stack.match(/\((.*?)\)/g);
  stack.forEach(function (line) {
    if (!line.match(/module\.js|native|co\/index\.js/g)) {
      result.push(line.replace('(', '').replace(')', ''));
    }
  });
  return result;
};

/**
 * @method printTitle
 * @param  {String} value
 * @param  {String} seperator
 */
Helpers.printTitle = (value, seperator) => {
  console.log('\n  ' + value);
  if (seperator) {
    console.log('  ' + new Array(value.length + 1).join(seperator));
  }
  console.log();
};