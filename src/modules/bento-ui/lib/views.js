import { api }  from 'bento';
import policies from 'policies';
import menu     from './menu';
import layout   from '../layout';

/**
 * @class Views
 * @param {Object} Views
 */
let Views = module.exports = {};

/**
 * Stores a list of fetched views.
 * @property store
 * @type     Object
 */
Views.store = {};

/**
 * @method add
 * @param {Array} views
 */
Views.add = function (views) {
  views.forEach(function(view) {

    // ### Template
    // If template array does not exist create it.

    if (!this.store[view.template]) {
      this.store[view.template] = [];
    }

    // ### Store View
    // Add the view to the view store under assigned template.

    this.store[view.template].push(view);

    // ### Menu

    if (view.menu) {
      view.menu.path = view.path;
      menu.add(view.menu);
    }

  }.bind(this));
};

/**
 * Returns all views registered under the provided template.
 * @method get
 * @param  {String} template
 */
Views.get = function (template) {
  return this.store[template] || [];
};

/**
 * Gets a list of routes that has been defined under the provided template views.
 * @method getRoutes
 * @param  {String} template
 */
Views.getRoutes = function (template) {
  return this.get(template).map((view) => {
    return {
      component : layout(view),
      path      : view.path,
      onEnter   : view.policy ? policies[view.policy] : undefined
    }
  });
};
