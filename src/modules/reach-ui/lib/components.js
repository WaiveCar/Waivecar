'use strict';

import React       from 'react';
import resources   from './resources';
import fields      from './fields';

// ### Components

/**
 * @class Components
 * @param {Object} components
 */
let Components = module.exports = {};

/**
 * Collection of registered components
 * @property store
 * @type     Object
 */
Components.store = {};

/**
 * @method register
 * @param  {Objects} components
 */
Components.register = function (component) {
  this.store[component.type] = component;
};

/**
 * Returns a component from the components store.
 * @method get
 * @param  {String} type
 * @return {Object}
 */
Components.get = function (type) {
  return this.store[type];
};

/**
 * Returns a component from the components store.
 * @method get
 * @param  {String} type
 * @return {Object}
 */
Components.getAll = function () {
  let map = [];
  for (let key in this.store) {
    map.push({
      category : 'Component',
      accepts  : [ 'Component' ],
      ...this.store[key]
    });
  }

  return map;
};

Components.getOptions = function(type) {
  let component = this.get(type);
  if (!component) {
    return console.error(`Reach UI > Invalid component requested [${ type }]`);
  }
  return component.options || [];
};

/**
 * @method render
 * @param  {String} component
 * @param  {Object} options
 * @param  {Object} props
 */
Components.render = function (type, options, props) {
  let component = this.get(type);
  if (!component) {
    return console.error(`Reach UI > Invalid component requested [${ type }]`);
  }
  let Component = component.class;
  return <Component { ...props } { ...options } />
};