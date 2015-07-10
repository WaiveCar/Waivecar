'use strict';

let cluster      = require('cluster');
let fs           = require('co-fs');
let path         = require('path');
let schemas      = require('../schemas');
let errorHandler = Reach.ErrorHandler;

// ### Export Config

module.exports = function *() {
  let User = require(path.join(Reach.INTERFACE_PATH, 'models', 'user.js'));
  yield schemas.add(User._table, User._schema);

  // ### Register Module Models

  let modules = yield fs.readdir(Reach.MODULE_PATH);
  for (let i = 0, len = modules.length; i < len; i++) {
    let module    = modules[i];
    let moduleDir = path.join(Reach.MODULE_PATH, module);
    if (yield fs.exists(path.join(moduleDir, 'package.json'))) {
      let json = JSON.parse(yield fs.readFile(path.join(moduleDir, 'package.json')));
      if (cluster.isMaster || 'test' === Reach.ENV && json.models) {
        for (let key in json.models) {
          let Model = require(path.join(moduleDir, json.models[key]));
          try {
            yield schemas.add(Model._table, Model._schema);
          } catch (err) {
            errorHandler.log('error', 'MySQL SERVER ERROR', {
              code    : err.code,
              message : err.toString(),
              stack   : errorHandler.parseStack(err.stack)
            });
          }
        }
      }
    }
  }
};