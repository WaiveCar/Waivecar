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
 * @method add
 * @param  {Object} settings
 */
Menu.add = function (settings) {

  // ### Store Locations
  // Store the menu in each assigned location.

  settings.locations.forEach(function(location) {
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
    parent : settings.parent,
    order  : settings.order,
    waiveAdmin: settings.waiveAdmin,
  };

};

/**
 * Returns a menu populated for the provided section.
 * @method get
 * @param  {String} section
 * @return {Array}
 */
Menu.get = function (section, forWaiveAdmin) {
  let map = [];
  for (let key in this.locations[section]) {
    let item = this.locations[section][key];
    if (!this.store[item].waiveAdmin || (this.store[item].waiveAdmin && forWaiveAdmin)) {
      map.push(this.store[item]);
    }
  }
  return map.sort((a, b) => { return a.order > b.order });
};
