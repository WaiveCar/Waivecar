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
      component : getComponent(view.type, view, module.fields, module.resource)
    })
  });
  return routes;
}

/**
 * @private
 * @method getComponent
 * @param  {String} type
 * @param  {Object} view
 * @param  {Object} fields
 * @param  {Object} resource
 * @return {Component}
 */
function getComponent(type, view, fields, resource) {
  switch (type) {
    case 'table' : return table(view, fields, resource);
    case 'form'  : return form(view, fields, resource);
  }
}