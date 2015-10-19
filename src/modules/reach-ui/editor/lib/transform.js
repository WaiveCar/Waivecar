'use strict';

import async          from 'async';
import { helpers  }   from 'reach-react';
import components     from '../../lib/components';
import ItemCategories from '../item-categories';

/**
 * @class Transform
 */
let Transform = module.exports = {};

/**
 * All Items (Rows, Columns, and each registered Component)
 * @type {Array}
 */
Transform.items = [
  { name : 'Row',    type : 'row',     icon : 'border_horizontal', category : ItemCategories.ROW,    accepts : [ ItemCategories.COLUMN ], options : {} },
  { name : 'Column', type : 'column',  icon : 'border_vertical',   category : ItemCategories.COLUMN, accepts : [ ItemCategories.ROW, ItemCategories.COMPONENT ], options : { width : 12 } }
];

/**
 * @param {Object}  component configuration object
 * @param {Number}  index
 */
Transform.toViewComponent = function(component, index) {
  if (Transform.items.length < 3) {
    Transform.items = Transform.items.concat(components.getAll());
  }

  let defaults = Transform.items.find(f => f.type === component.type);
  component.editorId = helpers.random(10);
  if (component.components) {
    component.components = component.components.map(Transform.toViewComponent);
  } else if (component.category !== ItemCategories.COMPONENT) {
    component.components = [];
  }
  return { ...defaults, ...component };
}

  /**
   * @param  {Object}
   * @param  {Function}
   * @return {Mixed}
   */
Transform.toComponent = function(viewComponent, next) {
  let component = {
    type    : viewComponent.type,
    options : viewComponent.options
  }
  if (component.options && component.options.canEdit) {
    delete component.options.canEdit;
  }

  if (viewComponent.type === 'container') {
    component.components = viewComponent.components;
  }
  if (component.components) {
    async.map(component.components, Transform.toComponent, function(err, components) {
      component.components = components;
      return next(null, component);
    })
  } else {
    return next(null, component);
  }
}
