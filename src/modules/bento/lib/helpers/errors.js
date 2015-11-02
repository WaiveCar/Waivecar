/**
 * @class Errors
 */
let Errors = module.exports = {};

/**
 * @method stack
 * @type   {String} stack
 * @return {Array}
 */
Errors.stack = (stack) => {
  var result = [];
  stack = stack.match(/\((.*?)\)/g);
  stack.forEach(function (line) {
    if (!line.match(/module\.js|native|co\/index\.js/g)) {
      result.push(line.replace('(', '').replace(')', ''));
    }
  });
  return result;
};