'use strict';

import { Auth } from 'reach-react';

/**
 * @class Menu
 */
let Menu = module.exports = {};

/**
 * @property list
 * @type     Object
 */
Menu.list = {};

/**
 * Check if a menu item by name has been defined in the target navigation.
 * @method hasMenu
 * @param  {String} target The target menu we are looking at
 * @param  {Object} menu
 */
Menu.hasMenu = function (target, menu) {
  return (Menu.list[target].index.indexOf(menu.name) !== -1);
};

/**
 * Check if a menu item by name has been defined in the target navigation.
 * @method hasMenu
 * @param  {String} target The target menu we are looking at
 * @param  {Object} menu
 */
Menu.addMenus = function (path, menus) {
  for (let key in menus) {
    if (!Menu.list[key]) {
      Menu.list[key] = {
        index : [],
        store : []
      };
    }
    if (!Menu.hasMenu(key, menus[key])) {
      Menu.addMenu(key, path, menus[key]);
    }
  }
};

/**
 * Adds a new menu item to the target location.
 * @method addMenu
 * @param  {String} target The target menu we are looking at
 * @param  {String} path   The uri path
 * @param  {Object} menu
 */
Menu.addMenu = function (target, path, menu) {
  Menu.list[target].index.push(menu.name);
  Menu.list[target].store.push({
    name   : menu.name,
    icon   : menu.icon || 'add_circle_outline',
    path   : path,
    parent : menu.parent
  });
};

/**
 * Returns a menu populated for the provided section.
 * @method get
 * @param  {String} section
 * @return {Array}
 */
Menu.get = function (section) {
  return Menu.list[section].store;
};