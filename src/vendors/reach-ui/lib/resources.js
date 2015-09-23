'use strict';

import { relay } from 'reach-react';

/**
 * @class Resources
 */
let Resources = module.exports = {};

/**
 * A store of resources, this is populated when the UI is loaded from the API.
 * @property store
 * @type     Object
 */
Resources.store = {};

/**
 * Set is currently responsible for creating a relays resource and default
 * actions based on the provided resource.
 * @method addResources
 * @param  {Array} list
 */
Resources.addResources = function (list) {
  for (let key in list) {
    let resource = list[key];
    this.prepare(key);
    this.store[key] = resource;
  }
};

/**
 * Returns a resource from the store based on the provided key.
 * @method get
 * @param  {String} key
 */
Resources.get = function (key) {
  return Resources.store[key];
};

/**
 * Prepares all the resources by creating relay reducers.
 * @method prepare
 * @param  {String} id
 */
Resources.prepare = function (id) {
  relay.resource(id, (state = [], action) => {
    switch (action.type) {
      case 'store':
        return [
          ...state,
          action.data
        ];
      case 'index':
        return action.data;
      case 'update':
        return state.map(function (obj) {
          if (obj.id === action.data.id) {
            return action.data;
          }
          return obj;
        });
      case 'delete':
        return state.map(function (obj) {
          if (obj.id === action.data.id) {
            return;
          }
          return obj;
        });
      default:
        return state;
    }
  });
};