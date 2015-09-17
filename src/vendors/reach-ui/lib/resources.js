'use strict';

import { Relay } from 'reach-react';

/**
 * @class Resources
 */
let Resources = module.exports = function (list) {
  Resources.list = list;
  for (let key in list) {
    Resources.set(list[key]);
  }
};

/**
 * A list of resources, this is populated when the UI is loaded from the API.
 * @property list
 * @type     Object
 */
Resources.list = {};

/**
 * Set is currently responsible for creating a relays resource and default
 * actions based on the provided resource.
 * @method set
 * @param  {Object} resource
 */
Resources.set = function (resource) {
  createResource (resource);
  createActions  (resource);
};

/**
 * Returns a resource from the list based on the provided key.
 * @method get
 * @param  {String} key
 */
Resources.get = function (key) {
  return Resources.list[key];
};

/**
 * Creates a reach.relay store from the provided resource.
 * @private
 * @method createResource
 * @param  {Object} resource
 */
function createResource(resource) {
  Relay.resource(resource.name, (state = [], action) => {
    switch (action.type) {
      case 'store':
        return [
          ...state,
          action[resource.store.key]
        ];
      case 'index':
        return action[resource.index.key];
      case 'update':
        return state.map(function (obj) {
          if (obj.id === action[resource.update.key].id) {
            return action[resource.update.key];
          }
          return obj;
        });
      case 'delete':
        return state.map(function (obj) {
          if (obj.id === action[resource.delete.key].id) {
            return;
          }
          return obj;
        });
      default:
        return state;
    }
  });
}

/**
 * Creates reach.relay store actions from the provided resource.
 * @private
 * @method createActions
 * @param  {Object} resource
 */
function createActions(resource) {
  let actions = {};
  let name    = resource.name.toUpperCase();
  actions[name + '_STORE'] = (val) => {
    let action                 = {};
    action.type                = 'store';
    action[resource.store.key] = val;
    return action;
  }
  actions[name + '_INDEX'] = (val) => {
    let action                 = {};
    action.type                = 'index';
    action[resource.index.key] = val;
    return action;
  }
  actions[name + '_UPDATE'] = (val) => {
    let action                  = {};
    action.type                 = 'update';
    action[resource.update.key] = val;
    return action;
  }
  actions[name + '_DELETE'] = (val) => {
    let action                  = {};
    action.type                 = 'delete';
    action[resource.delete.key] = val;
    return action;
  }
  Relay.actions(actions);
}