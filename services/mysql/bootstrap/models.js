'use strict';

var cluster = require('cluster');
var fs      = require('co-fs');
var path    = require('path');
var schemas = require('../schemas');

// ### Export Config

module.exports = function *() {
  let User = require(path.join(reach.INTERFACE_PATH, 'models', 'user.js'));
  yield schemas.add(User._table, User._schema);

  // ### Register Module Models

  let modules = yield fs.readdir(reach.MODULE_PATH);
  for (let i = 0, len = modules.length; i < len; i++) {
    let module    = modules[i];
    let moduleDir = path.join(reach.MODULE_PATH, module);
    if (yield fs.exists(path.join(moduleDir, 'package.json'))) {
      let json = JSON.parse(yield fs.readFile(path.join(moduleDir, 'package.json')));
      if (cluster.isMaster || 'test' === Reach.ENV && json.models) {
        for (let key in json.models) {
          let Model = require(path.join(moduleDir, json.models[key]));
          yield schemas.add(Model._table, Model._schema);
        }
      }
    }
  }
};