'use strict';

var connection = require('../connection');
let helpers    = require('./helpers');

/**
 * @class Insert
 * @static
 */
let Insert = module.exports = {};

/**
 * Performs a MySQL insert query with the provided table name and options.
 * @method insert
 * @param  {String} tableName
 * @param  {Object} options
 * @return {Object}
 */
Insert.query = function *(tableName, options) {
  return yield connection.query('INSERT INTO ' + tableName + ' SET ?', helpers.prepareOptions(options));
};