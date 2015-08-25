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
    let category     = configs[i];
    let uiPath       = path.join(Reach.CONFIG_PATH, category, 'ui.js');
    let uiFolderPath = path.join(Reach.CONFIG_PATH, category, 'ui');

    if (yield fs.exists(uiPath)) {
      ui = extend(true, ui, require(uiPath));
    } else if (yield fs.exists(uiFolderPath)) {
      let categoryFiles    = yield fs.readdir(uiFolderPath);
      let categorySections = categoryFiles.filter(function(f) { return f.indexOf('.js') > -1; });
      let categoryUi       = {};

      for (let f = 0, len = categorySections.length; f < len; f++) {
        let section             = path.join(uiFolderPath, categorySections[f]);
        let sectionName         = path.basename(section, '.js');
        categoryUi[sectionName] = require(section);
      }

      ui = extend(true, ui, { ui : categoryUi });
    }
  }

  return ui;
};
