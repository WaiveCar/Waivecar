'use strict';

import layout from './components/layout';

let routes = [
  {
    path      : '/dashboard',
    component : require('./views/dashboard')
  },
  {
    path      : '/profile',
    component : require('./views/profile')
  },
  {
    path      : '/past-rides',
    component : require('./views/past-rides')
  }
];

/**
 * @param {String} id
 * @param {Object} module
 */
export default function (views) {
  views.forEach(function (view) {
    routes.push({
      path      : view.route,
      component : layout(view)
    });
  });
  return routes;
}
