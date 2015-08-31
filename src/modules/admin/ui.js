'use strict';

import Reach from 'reach-react';

let menus = {
  sidebar : []
};

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
      href : '/admin/dashboard'
    }
  ]
}

/**
 * @method addMenus
 * @param  {Object} menus
 */
UI.addMenus = function (path, menus) {
  for (let key in menus) {
    if (UI.menu[key] && !this.hasMenu(key, menus[key])) {
      this.addMenu(key, path, menus[key]);
    }
  }
};

/**
 * Check if a menu item by name has been defined in the target navigation.
 * @method hasMenu
 * @param  {String} target The target menu we are looking at
 * @param  {Object} menu
 */
UI.hasMenu = function (target, menu) {
  return (menus[target].indexOf(menu.name) !== -1);
};

/**
 * Adds a new menu item to the target location.
 * @method addMenu
 * @param  {String} target The target menu we are looking at
 * @param  {String} path   The uri path
 * @param  {Object} menu
 */
UI.addMenu = function (target, path, menu) {
  this.menu[target].push({
    name : menu.name,
    icon : menu.icon || 'add_circle_outline',
    href : '/admin' + path
  });
  menus[target].push(menu.name);
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