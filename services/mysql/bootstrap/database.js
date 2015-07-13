'use strict';

let mysql  = require('mysql');
let error  = Reach.ErrorHandler;
let config = Reach.config;

module.exports = function *() {
  if (!config.mysql) {
    throw error.parse({
      code     : 'MYSQL_NO_CONFIG',
      message  : 'Missing mysql config, make sure you have set it up correctly',
      solution : 'Copy the MySQL config template from the mysql service folder and populate it into your api config'
    });
  }

  var host = mysql.createConnection({
    host     : config.mysql.host,
    user     : config.mysql.user,
    password : config.mysql.password
  });

  yield new Promise(function (resolve, reject) {
    host.connect(function (err) {
      if (err) { return reject(err); }
      resolve();
    });
  });

  yield new Promise(function (resolve, reject) {
    host.query('CREATE DATABASE IF NOT EXISTS ' + config.mysql.database + ' CHARACTER SET = utf8 COLLATE = ' + config.mysql.charset || 'utf8_unicode_ci', function (err) {
      if (err) { return reject(err); }
      resolve();
    });
  });
};