'use strict';

import Reach    from 'reach-react';
import policies from 'interface/policies';
import UI       from './ui';

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
      getRoutes(res.ui, cb);
    });
  }

};

function getRoutes(ui, cb) {
  routes = [ { path : '/admin', component : require('./views/dashboard') } ];
  for (let key in ui) {
    let module = ui[key];
    if (module.active) {
      routes.push({
        component   : require('./views/dynamic'),
        childRoutes : require('./routes')(key, module)
      });
    }
  }
  cb(null, routes);
}