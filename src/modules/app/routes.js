'use strict';

import table from './views/table';
import form  from './views/form';
import map   from './views/map';

/**
 * @param {String} id
 * @param {Object} module
 */
export default function (id, module) {
  let routes = [
    {
      path      : '/dashboard',
      component : require('./views/dashboard')
    },
    {
      path      : '/profile',
      component : require('./views/profile')
    }
  ];
  module.views.forEach(function (view) {
    routes.push({
      path      : view.route,
      component : getComponent(view, module)
    });
  });
  return routes;
}

/**
 * @private
 * @method getComponent
 * @param  {Object} view
 * @param  {Object} module
 * @return {Component}
 */
function getComponent(view, module) {
  switch (view.type) {
    case 'table' : return table(view, module.fields, module.resource);
    case 'form'  : return form(view, module.fields, module.resource);
    case 'map'   : return map(view, module.fields, module.resource);
  }
}