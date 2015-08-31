'use strict';

import table from './views/table';
import form  from './views/form';

/**
 * @param {String} id
 * @param {Object} module
 */
export default function (id, module) {
  let routes = [];
  module.views.forEach(function (view) {
    routes.push({
      path      : 'admin/' + view.route,
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
  }
}