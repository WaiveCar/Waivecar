'use strict';

import Reach    from 'reach-react';
import policies from 'interface/policies';
import UI       from './ui';

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
    Reach.API.get('/ui/admin', function (err, res) {
      if (err) {
        return cb(err);
      }
      prepareUi(res.ui, cb);
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
  routes = [
    {
      path    : '/admin',
      onEnter : (nextState, transition) => {
        transition.to('/admin/dashboard');
      }
    },
    { 
      path      : '/admin/dashboard', 
      component : require('./views/dashboard')
    }
  ];




  for (let key in ui) {
    let module = ui[key];
    if (module.active) {
      setResource(module.resource);
      routes.push({
        component   : require('./views/dynamic'),
        childRoutes : require('./routes')(key, module)
      });
    }
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
}