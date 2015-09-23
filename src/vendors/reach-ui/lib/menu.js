'use strict';

import { auth } from 'reach-react';

/**
 * @class Menu
 */
let Menu = module.exports = {};

/**
 * @property locations
 * @type     Array
 */
Menu.locations = [];

/**
 * @property store
 * @type     Object
 */
Menu.store = {};

/**
 * Adds a new menu item to the target location.
 * @method addMenu
 * @param  {Object} settings
 */
Menu.addMenu = function (settings) {

  // ### Store Locations
  // Store the menu in each assigned location.

  settings.locations.forEach((location) => {
    if (!this.locations[location]) {
      this.locations[location] = [];
    }
    this.locations[location].push(settings.title);
  }.bind(this));

  // ### Store Menu
  // Store the menu configuration in the menu store.

  this.store[settings.title] = {
    title  : settings.title,
    icon   : settings.icon || 'add_circle_outline',
    path   : settings.path,
    parent : settings.parent
  };

};

/**
 * Returns a menu populated for the provided section.
 * @method get
 * @param  {String} section
 * @return {Array}
 */
Menu.get = function (section) {
  return this.locations[section].map((title) => {
    return this.store[title];
  }.bind(this));
};