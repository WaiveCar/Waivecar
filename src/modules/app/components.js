'use strict';

import table     from './components/table';
import form      from './components/form';
import map       from './components/map';
import miniChart from './components/mini-chart';

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
    case 'Table'     : return table(component, fields, resource);
    case 'Form'      : return form(component, fields, resource);
    case 'Map'       : return map(component, fields, resource);
    case 'MiniChart' : return miniChart(component, fields, resource);
  }
}