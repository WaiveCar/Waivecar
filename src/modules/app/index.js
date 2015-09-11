'use strict';

import Reach      from 'reach-react';
import policies   from 'interface/policies';
import UI         from './ui';
import Components from './components';

let Relay  = Reach.Relay;
let routes = null;

export default  {

  onEnter   : policies.isAuthenticated,

  component : require('./layout'),

  /**
   * @method getChildRoutes
   * @param  {} state
   * @param  {Function} cb
   */
  getChildRoutes(state, cb) {
    if (routes) {
      return cb(null, routes); // Lets not
    }

    if (!Reach.Auth.check()) {
      return cb(null, routes);
    }

    Reach.API.get('/ui', function (err, res) {
      if (err) {
        return cb(err);
      }

      prepareUi(res, cb);
    });
  }

};

/**
 * @private
 * @method prepareUi
 * @param  {Object}   ui
 * @param  {Function} cb
 */
function prepareUi(ui, cb) {
  routes = [];
  for (let key in ui.resources) {
    setResource(ui.resources[key]);
  }

  for (let key in ui.components) {
    let components = ui.components[key];
    let resource   = ui.resources[key];
    let fields     = ui.fields[key];
    for (let componentKey in components) {
      let component = components[componentKey];
      Components.add(component, fields, resource);
    }
  }

  for (let key in ui.views) {
    let module = ui.views[key];
    routes.push({
      component   : require('./views/dynamic'),
      childRoutes : require('./routes')(module)
    });
  }

  cb(null, routes);
}

/**
 * Creates a relay resource with the provided resource.
 * @private
 * @method setResource
 * @param  {Object} resource
 */
function setResource(resource) {
  Relay.resource(resource.name, function (state = [], action) {
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