'use strict';

let changeCase = require('change-case');
var connection = require('../connection');
let helpers    = require('./helpers');

/**
 * @class Select
 * @static
 */
let Select = module.exports = {};

/**
 * Performs a MySQL select query with the provided table name and otions.
 * @method select
 * @param  {String} tableName
 * @param  {Object} options
 * @return {Object}
 */
Select.query = function *(tableName, options) {
  let sql  = '';
  let data = [];

  sql += handleSelect(options.attributes, tableName, data);
  if (options.where && Object.keys(options.where).length) {
    sql += handleWhere(options.where, data) + ' AND deleted_at IS NULL';
  } else {
    sql += ' WHERE deleted_at IS NULL';
  }
  if (options.order)  { sql += helpers.handleOrderBy(options.order, data); }
  if (options.limit)  { sql += ' LIMIT '    + options.limit; }
  if (options.offset) { sql += ' OFFSET '   + options.offset; }

  // ### Query

  let result = yield connection.query(sql, data);
  if (!result.length)      { return null; }
  if (1 === options.limit) { return result[0]; }
  return result;
};

/**
 * @private
 * @method handleSelect
 * @param  {Array}  [attributes]
 * @param  {String} tableName
 * @param  {Array}  data
 * @return {String}
 */
function handleSelect(attributes, tableName, data) {
  return 'SELECT ' + handleAttributes(attributes, data) + ' FROM ' + tableName.replace(/[^a-zA-Z_]/g, '');
}

/**
 * @private
 * @method handleAttributes
 * @param  {Array} [attributes]
 * @param  {Array} data
 * @return {String}
 */
function handleAttributes(attributes, data) {
  if (!attributes || Array !== data.constructor) {
    return '*';
  }
  let result = [];
  attributes.forEach(function (attribute) {
    result.push(changeCase.snakeCase(attribute.replace(/[^a-zA-Z]/g, '')));
  });
  return result.join(', ');
}

/**
 * @private
 * @method handleWhere
 * @param  {Object} where
 * @param  {Array}  data
 * @return {String}
 */
function handleWhere(where, data) {
  return ' WHERE ' + handleAnd(where, data);
}

/**
 * @private
 * @method handleAnd
 * @param  {Object} values
 * @param  {Array}  data
 * @param  {String} [parentKey]
 * @return {String}
 */
function handleAnd(values, data, parentKey) {
  let sql = [];
  for (let key in values) {
    sql.push(handleValue(key, values[key], data, parentKey));
  }
  return sql.join(' AND ');
}

/**
 * @private
 * @method handleOr
 * @param  {Object} values
 * @param  {Array}  data
 * @param  {String} [parentKey]
 * @return {String}
 */
function handleOr(values, data, parentKey) {
  let sql = [];
  if (Array === values.constructor) {
    values.forEach(function (value) {
      sql.push(handleAnd(value, data, parentKey));
    });
  } else {
    for (let key in values) {
      sql.push(handleValue(key, values[key], data, parentKey));
    }
  }
  return sql.join(' OR ');
}

/**
 * @private
 * @method handleValue
 * @param  {String} key
 * @param  {Mixed}  values
 * @param  {Array}  data
 * @param  {String} [parentKey]
 * @return {String}
 */
function handleValue(key, value, data, parentKey) {
  let sql = null;

  parentKey = parentKey ? changeCase.snakeCase(parentKey.replace(/[^a-zA-Z]/g, '')) : '';

  switch (key) {
    case '$or'         : return handleOr(value, data, parentKey);
    case '$gt'         : sql = parentKey + ' > ?'; break;
    case '$gte'        : sql = parentKey + ' >= ?'; break;
    case '$lt'         : sql = parentKey + ' < ?'; break;
    case '$lte'        : sql = parentKey + ' <= ?'; break;
    case '$ne'         : sql = parentKey + ' id != ?'; break;
    case '$between'    : sql = parentKey + ' BETWEEN ? AND ?'; break;
    case '$notBetween' : sql = parentKey + ' NOT BETWEEN ? AND ?'; break;
    case '$in'         : sql = parentKey + ' IN ('+ helpers.joinArray(value, data) +')'; break;
    case '$like'       : sql = parentKey + ' LIKE ?'; break;
    case '$notLike'    : sql = parentKey + ' NOT LIKE ?'; break;
    case '$iLike'      : sql = parentKey + ' ILIKE ?'; break;
    case '$notILike'   : sql = parentKey + ' NOT ILIKE ?'; break;
    case '$likeAny'    : sql = parentKey + ' LIKE ANY ARRAY['+ helpers.joinArray(value, data) +']'; break;
    case '$eq'         : sql = parentKey + ' = ?';  break;
  }

  if (sql) {
    if (value && Array === value.constructor) {
      value.forEach(function (val) {
        data.push(val);
      });
    } else {
      data.push(value);
    }
    return sql;
  }

  if (value && Object === value.constructor) {
    return handleAnd(value, data, key);
  } else {
    data.push(value);
    return changeCase.snakeCase(key.replace(/[^a-zA-Z]/g, '')) + ' = ?';
  }
}