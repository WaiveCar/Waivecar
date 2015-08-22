'use strict';

let fs     = require('co-fs');
let path   = require('path');
let extend = require('extend');

/**
 * @class AdminService
 */
let AdminService = module.exports = {};

/**
 * @method ui
 * @param  {User} _user
 * @return {Object}
 */
AdminService.ui = function *() {
  let configs = yield fs.readdir(Reach.CONFIG_PATH);
  let ui      = {};
  for (let i = 0, len = configs.length; i < len; i++) {
    let category = configs[i];
    let uiPath   = path.join(Reach.CONFIG_PATH, category, 'ui.js');
    if (yield fs.exists(uiPath)) {
      ui = extend(true, ui, require(uiPath));
    }
  }
  return ui;
};