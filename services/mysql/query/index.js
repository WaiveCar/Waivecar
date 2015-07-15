'use strict';

var connection = require('../connection');
let helpers    = require('./helpers');

/**
 * Query
 * =====
 *
 * Stability: 2 - Unstable
 *
 * Provides a range of MySQL functionality to perform data operations against a MySQL database.
 *
 * @author Christoffer Rødvik
 * @class  Query
 * @static
 */
var Query = module.exports = function *query(sql, options) {
  return yield connection.query(sql, helpers.prepareOptions(options));
};

/**
 * Gives shortcut access to insert query.
 * @property insert
 * @type     Function
 */
Query.insert = require('./insert').query;

/**
 * Gives shortcut access to upsert query.
 * @property upsert
 * @type     Function
 */
Query.upsert = require('./upsert').query;

/**
 * Gives shortcut access to the select query.
 * @property select
 * @type     Function
 */
Query.select = require('./select').query;

/**
 * Gives shortcut access to the ReachQL query.
 * @property ql
 * @type     Function
 */
Query.ql = require('./reachQL').query;