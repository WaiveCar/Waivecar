'use strict';

import React     from 'react';
import resources from './resources';
import fields    from './fields';

// ### Components

import table     from '../components/table';
import form      from '../components/form';
import map       from '../components/map';
import miniChart from '../components/mini-chart';
import profile   from '../components/profile';
import content   from '../components/content';

/**
 * @class Components
 * @param {Object} components
 */
let Components = module.exports = function (list) {
  for (let key in list) {
    let component = list[key];
    let resource  = resources.get(key);
    let field     = fields.get(key);

    // ### Create Components
    // Loop through the list of components and create them for use in react.

    for (let key in component) {
      Components.add(component[key], field, resource);
    }
  }
};

/**
 * Collection of registered components
 * @property list
 * @type     Object
 */
Components.list = {};

/**
 * @method add
 * @param  {String} configuration
 * @param  {Object} fields
 * @param  {Object} resource
 */
Components.add = function (component, fields, resource) {
  Components.list[component.name] = getComponent(component, fields, resource);
};

/**
 * Returns a component from the components list.
 * @method get
 * @param  {String} key
 * @return {Object}
 */
Components.get = function (key) {
  return Components.list[key];
};

/**
 * @method renderComponent
 * @param  {String} component
 * @param  {Object} props
 */
Components.renderComponent = (component, props) => {
  let name      = getComponentName(component);
  let Component = Components.get(name);

  return (
    <Component { ...props } { ...component.options }>
      { props.children }
    </Component>
  );
};

/**
 * Returns the name of the provided component.
 * @method getComponentName
 * @param  {Mixed} component
 * @return {String}
 */
function getComponentName(component) {
  if (typeof component === 'string' || component instanceof String) {
    return component; // simple / no options.
  } else if (component.name) {
    return component.name; // object (potentially with options)
  } else {
    throw new Error('Component not well defined', component);
  }
}

/**
 * @private
 * @method getComponent
 * @param  {Object} component
 * @param  {Object} fields
 * @param  {Object} resource
 */
function getComponent(component, fields, resource) {
  switch (component.type) {
    case 'Profile'   : return profile(component, fields, resource);
    case 'Table'     : return table(component, fields, resource);
    case 'Content'   : return content(component, fields, resource);
    case 'Form'      : return form(component, fields, resource);
    case 'Map'       : return map(component, fields, resource);
    case 'MiniChart' : return miniChart(component, fields, resource);
  }
}