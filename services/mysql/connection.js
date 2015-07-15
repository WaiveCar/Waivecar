'use strict';

var wrapper = require('co-mysql');
var mysql   = require('mysql');

/**
 * MySql config defined in the primary config files
 * @property config
 * @type     object
 */
var config = Reach.config.mysql;

/**
 * Connection pool where the adapter retrives query connections.
 * @property pool
 * @type     object
 */
var pool = mysql.createPool({
  host     : config.host,
  database : config.database,
  user     : config.user,
  password : config.password,
  charset  : config.charset
});

// ### Export Adapter

module.exports = wrapper(pool);