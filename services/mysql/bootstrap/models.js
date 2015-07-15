'use strict';

let fs      = require('co-fs');
let path    = require('path');
let schemas = require('../schemas');
let error   = Reach.ErrorHandler;

module.exports = function *() {
  let User = require(path.join(Reach.INTERFACE_PATH, 'user.js'));
  yield schemas.add(User._table, User._schema);

  // ### Register Module Models

  let models = yield getAllModels();
  if (models.length) {
    for (let i = 0, len = models.length; i < len; i++) {
      yield schemas.add(models[i]._table, models[i]._schema);
    }
  }
};

/**
 * Returns a list of all the models registered in the API
 * @method getAllModels
 * @return {Array}
 */
function *getAllModels() {
  let models  = [];
  let modules = yield fs.readdir(Reach.MODULE_PATH);

  for (let i = 0, len = modules.length; i < len; i++) {
    let module = modules[i];
    let dir    = path.join(Reach.MODULE_PATH, module);
    if (yield fs.exists(path.join(dir, 'package.json'))) {
      let config = JSON.parse(yield fs.readFile(path.join(dir, 'package.json')));
      if (config.models) {
        for (let key in config.models) {
          let file   = path.join(dir, config.models[key]);
          let exists = yield fs.exists(file);
          if (!exists) {
            throw error.parse({
              code    : 'MYSQL_MODEL_NOT_FOUND',
              message : 'Could not find ' + file
            });
          }
          models.push(require(file));
        }
      }
    }
  }

  return models;
}