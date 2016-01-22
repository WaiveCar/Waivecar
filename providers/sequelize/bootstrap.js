'use strict';

let mysql     = require('mysql');
let sequelize = Bento.provider('sequelize');
let Group     = Bento.model('Group');
let GroupRole = Bento.model('GroupRole');
let Role      = Bento.model('Role');
let log       = Bento.Log;
let config    = Bento.config.sequelize;

module.exports = function *() {
  let host = mysql.createConnection({
    host     : config.host,
    user     : config.username,
    password : config.password
  });
  yield database(host);
  yield groups();
  yield roles();
  yield require('./setup');
};

/**
 * Sets up the database.
 * @param  {Object} host
 * @return {Void}
 */
function *database(host) {

  // ### Connection Test
  // Test to see if the connection is valid.

  yield new Promise((resolve, reject) => {
    host.connect((err) => {
      if (err) {
        return reject(err);
      }
      log.info(' - Connection Success!');
      resolve();
    });
  });

  // ### Drop Database
  // Drop database if force is set to true.

  if (config.force) {
    yield new Promise((resolve, reject) => {
      host.query('DROP DATABASE IF EXISTS ' + config.database, (err) => {
        if (err) {
          return reject(err);
        }
        log.info(` - Dropped Database [${ config.database }]`);
        resolve();
      });
    });
  }

  // ### Create Database

  yield new Promise((resolve, reject) => {
    host.query('CREATE DATABASE IF NOT EXISTS ' + config.database + ' CHARACTER SET = utf8 COLLATE = ' + (config.charset || 'utf8_unicode_ci'), (err) => {
      if (err) {
        return reject(err);
      }
      log.info(` - Created Database [${ config.database }]`);
      resolve();
    });
  });

  // ### Sync Models

  yield sequelize.sync({
    force : config.force
  });

}

/**
 * Creates default group if it hasn't been defined.
 * @return {Void}
 */
function *groups() {
  let count = yield Group.count({ where : { name : 'general' } });
  if (!count) {
    let group = new Group({
      name : 'general'
    });
    yield group.save();
  }
}

/**
 * Creates the default roles if they have not been created.
 * @return {Void}
 */
function *roles(host) {
  let defRoles = [
    { title : 'User',          name : 'user',      position : 0 },
    { title : 'Moderator',     name : 'moderator', position : 1 },
    { title : 'Administrator', name : 'admin',     position : 2 },
    { title : 'Owner',         name : 'owner',     position : 3 },
    { title : 'Super User',    name : 'super',     position : 4 }
  ];
  let count = yield Role.count();
  if (!count) {
    for (let i = 0, len = defRoles.length; i < len; i++) {
      let data = defRoles[i];

      // ### Create Role

      let role = new Role({
        name     : data.name,
        position : data.position
      });
      yield role.save();

      // ### Create Group Role

      let groupRole = new GroupRole({
        groupId : 1,
        roleId  : role.id,
        name    : data.title
      });
      yield groupRole.save();
    }
  }
}
