'use strict';

import { api }  from 'reach-react';
import policies from 'interface/policies';
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
 * Returns all views registered under the provided template.
 * TODO: The view store needs to be registered as a reducer so that
 *       we can update it via reach-relay.
 *
 * @method get
 * @param  {String}   template
 * @param  {Function} done
 */
Views.get = function (template, done) {
  if (this.store[template]) {
    return done(null, this.store[template]);
  }

  // ### Fetch Views
  // If views have not yet been loaded we request them from the API.

  api.get(`/ui/views/${template}`, (error, views) => {
    if (error) {
      return done(error);
    }

    // ### Store Template
    // Add the template views to the views store, all views must
    // belong to a template which serves are the primary layout.

    this.store[template] = views;

    // ### Register Menus

    views.forEach((view) => {
      menu.addMenu(view.menu);
    });

    done(null, views);
  }.bind(this));
};

/**
 * Gets a list of routes that has been defined under the provided template views.
 * @method getRoutes
 * @param  {String}   template
 * @param  {Function} done
 */
Views.getRoutes = function (template, done) {
  this.get(template, (error, views) => {
    if (error) {
      return done(error);
    }
    let routes = [];
    views.forEach((view) => {
      routes.push({
        component : layout(view),
        path      : view.menu.path,
        onEnter   : view.policy ? policies[view.policy] : undefined
      });
    });
    done(null, routes);
  });
};