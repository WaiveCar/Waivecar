'use strict';

let changeCase = require('change-case');
let connection = require('../connection');
let helpers    = require('./helpers');

/**
 * @class Upsert
 * @static
 */
let Upsert = module.exports = {};

/**
 * Performs a MySQL insert query with the provided table name and options.
 * @method insert
 * @param  {String} tableName
 * @param  {Object} options
 * @return {Object}
 */
Upsert.query = function *(tableName, options) {
  let data         = [];
  let insertString = getInsertString(data, options);
  return yield connection.query('INSERT INTO ' + tableName + ' '+ insertString +' ON DUPLICATE KEY UPDATE ?, updated_at = NOW()', data.concat([helpers.prepareOptions(options)]));
};

/**
 * Returns a () VALUES () formated string.
 * @private
 * @method getInsertString
 * @param  {Array}  data
 * @param  {Object} options
 * @return {String}
 */
function getInsertString(data, options) {
  let keys = [];
  let vals = [];
  for (var key in options) {
    keys.push(changeCase.snakeCase(key));
    vals.push('?');
    data.push(options[key]);
  }
  return '('+ keys.join(', ') +') VALUES ('+ vals.join(', ') +')';
}