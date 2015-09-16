'use strict';

import React     from 'react';
import table     from './components/table';
import form      from './components/form';
import map       from './components/map';
import miniChart from './components/mini-chart';
import profile   from './components/profile';

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
Components.add = (component, fields, resource) => {
  Components.list[component.name] = getComponent(component, fields, resource);
};

Components.renderComponent = (component, props) => {
  let componentName;
  if (typeof component === 'string' || component instanceof String) {
    // simple / no options.
    componentName = component;
  } else if (component.name) {
    // object (potentially with options)
    componentName = component.name;
  } else {
    console.log(component);
    throw new Error('Component not well defined', component);
  }

  let Component = Components.list[componentName];
  return (
    <Component { ...props } { ...component.options }>
      { props.children }
    </Component>
  );
};

function getComponent(component, fields, resource) {
  switch (component.type) {
    case 'Profile'   : return profile(component, fields, resource);
    case 'Table'     : return table(component, fields, resource);
    case 'Form'      : return form(component, fields, resource);
    case 'Map'       : return map(component, fields, resource);
    case 'MiniChart' : return miniChart(component, fields, resource);
  }
}