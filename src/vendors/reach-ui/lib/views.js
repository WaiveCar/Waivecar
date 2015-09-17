'use strict';

import layout from '../components/layout';

/**
 * @class Views
 * @param {Object} Views
 */
let Views = module.exports = function (list) {
  for (let key in list) {
    let views = list[key];
    Views.addRoute({
      childRoutes : () => {
        let routes = [];
        views.forEach(function (view) {
          routes.push({
            path      : view.route,
            component : layout(view)
          });
        });
        return routes;
      }()
    });
  }
};

/**
 * List of view routes.
 */
Views.routes = [];

/**
 * Concatonates a list of provided routes to the current routes list.
 * @method addRoutes
 * @param  {Array} routes
 */
Views.addRoutes = function (routes) {
  Views.routes = Views.routes.concat(routes);
};

/**
 * Adds a new route to the routes list.
 * @method addRoute
 * @param  {Object} route
 */
Views.addRoute = function (route) {
  Views.routes.push(route);
};

/**
 * Returns the list of routes.
 * @method getRoutes
 * @return {Array}
 */
Views.getRoutes = function () {
  return Views.routes;
};