'use strict';

var changeCase = require('change-case');

/**
 * Class offering a variety of query helper methods.
 * @class Helpers
 * @static
 */
let Helpers = module.exports = {};

/**
 * Returns model key and creator.
 * @method getModel
 * @param  {Mixed} options Can be a string or object
 * @return {Object}
 */
Helpers.getModel = function (options) {
  var model = {};

  model.key     = 'string' === typeof options ? options : Object.keys(options)[0];
  model.creator = Reach.model(model.key);

  return model.creator ? model : false;
};

/**
 * Adds values to the data array and return a string of comma seperated ? equal to amount of values.
 * @private
 * @method joinArray
 * @param  {Array} values
 * @param  {Array} data
 * @return {String}
 */
Helpers.joinArray = function (values, data) {
  var vals = [];
  values.forEach(function (val) {
    vals.push('?');
    data.push(val);
  });
  return vals.join(',');
};

/**
 * Prepares MySQL options
 * @private
 * @method prepareOptions
 * @param  {Object} [options]
 * @return {Object}
 */
Helpers.prepareOptions = function(options) {
  if (!options) {
    return {};
  }

  if (Object === options.constructor) {
    options = Helpers.changeKeyCase(options);
  }

  if (Array === options.constructor) {
    for (var i = 0, len = options.length; i < len; i++) {
      if (Object === options[i].constructor) {
        options[i] = Helpers.changeKeyCase(options[i]);
      }
    }
  }

  return options;
};

/**
 * Converts keys in an object from camelCase to snake_case
 * @private
 * @method changeKeyCase
 * @param  {object} obj
 * @return {object}
 */
Helpers.changeKeyCase = function (obj) {
  var converted = {};
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var newKey = key;
      if (-1 === key.indexOf('.')) {
        newKey = changeCase.snakeCase(key);
      }
      converted[newKey] = obj[key];
    }
  }
  return converted;
};

/**
 * @private
 * @method handleOrderBy
 * @param  {Array} order
 * @param  {Array} data
 * @return {String}
 */
Helpers.handleOrderBy = function (order, data) {
  var sql = [];

  if ('object' === typeof order[0]) {
    for (var i = 0, len = order.length; i < len; i++) {
      sql.push(Helpers.handleOrderBy(order[i], data));
    }
    return sql.join(', ');
  }

  var direction = order.pop();
  if ('ASC' !== direction && 'DESC' !== direction) {
    return '';
  }
  order.forEach(function (val) {
    sql.push(changeCase.snakeCase(val.replace(/[^a-zA-Z]/g, '')));
  });
  return ' ORDER BY ' + sql.join(', ') + ' ' + direction;
};