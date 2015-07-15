'use strict';

var cluster    = require('cluster');
var connection = require('./connection');
var changeCase = require('change-case');
var config     = Reach.config.mysql;

/**
 * @class Schemas
 * @static
 */
var Schemas = module.exports = {};

/**
 * Add a new schema to the schema storage
 * @method add
 */
Schemas.add = function *(table, schema) {
  if (cluster.isMaster || 'test' === Reach.ENV) {
    if (config.force) {
      yield dropTable(table);
    }
    yield prepareTable(table, schema);
  }
};

/**
 * Drops the table from the database
 * @private
 * @method dropTable
 * @param {String} table
 */
function *dropTable(table) {
  yield connection.query('DROP TABLE IF EXISTS `'+ table +'`');
}

/**
 * @private
 * @method prepareTable
 * @param {String} table
 * @param {Object} schema
 */
function *prepareTable(table, schema) {
  let res = yield connection.query('SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = ?', [config.database, table]);
  schema.columns = changeKeyCase(schema.attributes);
  if (1 == res[0].count) {
    yield alterTable(table, schema);
  } else {
    yield createTable(table, schema);
  }
}

/**
 * Alters the table by adding or dropping columns from a table.
 * @private
 * @method alterTable
 * @param  {String} table
 * @param  {Object}  schema
 */
function *alterTable(table, schema) {
  let res          = yield connection.query('SHOW COLUMNS FROM ' + table);
  let addColumns   = {};
  let dropColumns  = [];
  let schemaKeys   = Object.keys(schema.columns).concat(['created_at', 'updated_at', 'deleted_at']);
  let tableColumns = res.reduce(function (result, obj) {
    result.push(obj.Field);
    return result;
  }, []);

  // ### Find Adds

  let previousKey = null;
  for (let i = 0, len = schemaKeys.length; i < len; i++) {
    let key = schemaKeys[i];
    if (-1 === tableColumns.indexOf(key)) {
      addColumns[schemaKeys[i]] = {
        previous : previousKey,
        sql      : schema.columns[schemaKeys[i]]
      };
    }
    previousKey = key;
  }

  // ### Find Drops

  for (let i = 0, len = tableColumns.length; i < len; i++) {
    let key = tableColumns[i];
    if (-1 === schemaKeys.indexOf(key)) {
      dropColumns.push(key);
    }
  }

  // ### Alter Table

  if (Object.keys(addColumns).length || dropColumns.length) {
    yield modifyTable(table, addColumns, dropColumns);
  }
}

/**
 * Modifies a table
 * @private
 * @method modifyTable
 * @param  {string}   table
 * @param  {object}   addColumns
 * @param  {array}    dropColumns
 */
function *modifyTable(table, addColumns, dropColumns) {
  var query = 'ALTER TABLE `'+ table +'` ';
  for (var key in addColumns) {
    query += 'ADD COLUMN `'+ key +'` ' + addColumns[key].sql + ' AFTER `'+ addColumns[key].previous +'`, ';
  }
  dropColumns.forEach(function (key) {
    query += 'DROP COLUMN `'+ key +'`, ';
  });
  query = query.replace(/(^, )|(, $)/g, '');
  yield connection.query(query);
}

/**
 * Creates a new table if it does not exist.
 * @private
 * @method createTable
 * @param  {string}   table
 * @param  {object}   schema
 */
function *createTable(table, schema) {
  var query = 'CREATE TABLE IF NOT EXISTS `'+ table +'` (';

  // ### Prepare Columns

  for (var key in schema.columns) {
    query += '`'+ key +'` ' + schema.columns[key] + ', ';
  }

  // ### Default Timestamps

  query += 'created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, ';
  query += 'updated_at timestamp NULL, ';
  query += 'deleted_at timestamp NULL, ';

  // ### Primary Key

  if (schema.primaryKey) {
    query += 'PRIMARY KEY (`'+ schema.primaryKey +'`), ';
  }

  // ### Unique Keys

  if (schema.uniqueKeys) {
    for (var uniqueKey in schema.uniqueKeys) {
      query += 'UNIQUE KEY `'+ changeCase.snakeCase(uniqueKey) +'` (`'+ schema.uniqueKeys[uniqueKey].join('`,`') +'`), ';
    }
  }

  // ### Constraints

  if (schema.constraints) {
    for (var constraint in schema.constraints) {
      query += 'CONSTRAINT `'+ changeCase.snakeCase(constraint) +'` UNIQUE (`'+ schema.constraints[constraint].join('`,`') +'`), ';
    }
  }

  // ### Remove Trailing Comma

  query = query.replace(/(^, )|(, $)/g, '') + ')';

  // ### Create Table

  yield connection.query(query);
}

/**
 * Converts keys in an object from camelCase to snake_case
 * @private
 * @method changeKeyCase
 * @param  {object} obj
 * @return {object}
 */
function changeKeyCase(obj) {
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
}