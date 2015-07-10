/**
  Database Setup
  ==============
  @author  Christoffer Rødvik
  @license MIT
 */

'use strict';

// ### Dependencies

var mysql  = require('mysql');
var config = Reach.config;

// ### Export Config

module.exports = function *() {
  if (!config.mysql) {
    return;
  }

  var host = mysql.createConnection({
    host     : config.mysql.host,
    user     : config.mysql.user,
    password : config.mysql.password
  });

  yield function (done) {
    host.connect(function (err) {
      if (err) {
        Reach.Logger.error(' - MySQL Connection Error [%s]', err.toString());
        done(new Error());
      }
      done();
    });
  };

  yield function (done) {
      host.query('CREATE DATABASE IF NOT EXISTS ' + config.mysql.database + ' CHARACTER SET = utf8 COLLATE = ' + config.mysql.charset, function (err) {
      if (err) {
        Reach.Logger.error(' - MySQL Database Error [%s]', err.toString());
        return done(new Error());
      }
      done();
    });
  };
};