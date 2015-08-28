'use strict';

import Reach from 'reach-react';

/**
 * @class UI
 */
let UI = module.exports = {};

/**
 * @property menu
 * @type     Array
 */
UI.menu = {
  sidebar : [
    {
      name : 'Dashboard',
      icon : 'dashboard',
      href : '/admin'
    }
  ]
}

/**
 * @method addMenus
 * @param  {Object} menus
 */
UI.addMenus = function (path, menus) {
  for (let key in menus) {
    if (!UI.menu[key]) {
      continue; // Only set menus that exists
    }
    let menu = menus[key];
    UI.menu[key].push({
      name : menu.name,
      icon : menu.icon || 'add_circle_outline',
      href : '/admin' + path
    });
  }
};

/**
 * @method set
 * @param  {Object} ui
 */
UI.set = function (ui) {
  for (let key in ui) {
    let module = ui[key];
    if (!module.active) {
      continue; // Only set active modules
    }
    this.menu.push({
      name : module.displayName || key,
      icon : module.icon        || 'add_circle_outline',
      href : '/admin' + module.path
    });
  }
};