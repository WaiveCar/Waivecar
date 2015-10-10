'use strict';

/**
 * @class Search
 */
let Search = module.exports = {};

  /**
   * findViewComponent  Given an Id, return a ViewComponent and it's location in the Tree
   * @param  {Object}   parent
   * @param  {Number}   index
   * @param  {Object}   component
   * @param  {String}   id
   * @return {Object}   An object containing the Component, it's Parent and the index of the Child
   */
Search.findViewComponent = function(parent, index, component, editorId) {
  if (component.editorId && component.editorId === editorId) {
    return {
      parent    : parent,
      index     : index,
      component : component
    };
  } else if (component.components && component.components.length > 0) {
    let result = null;
    for (let i = 0; !result && i < component.components.length; i++) {
      result = Search.findViewComponent(component, i, component.components[i], editorId);
    }
    return result;
  }
  return null;
}
