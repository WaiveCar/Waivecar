'use strict';

import table from './components/table';
import form  from './components/form';
import map   from './components/map';

/**
 * @class Components
 */
let Components = module.exports = {};

/**
 * @object collection of registered components
 */
Components.list = {};

/**
 * @method add
 * @param  {String}   configuration
 */
Components.add = function (component, fields, resource) {
  Components.list[component.name] = getComponent(component, fields, resource);
};

function getComponent(component, fields, resource) {
  switch (component.type) {
    case 'table' : return table(component, fields, resource);
    case 'form'  : return form(component, fields, resource);
    case 'map'   : return map(component, fields, resource);
  }
}