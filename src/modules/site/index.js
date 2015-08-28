'use strict';

import Reach    from 'reach-react';
import policies from 'interface/policies';

let routes = null;

export default  {

  component : require('./layout'),

  /**
   * @method getChildRoutes
   * @param  {} state
   * @param  {Function} cb
   */
  getChildRoutes(state, cb) {
    return cb(null, [
      {
        path      : '/',
        component : require('./views/home')
      }
    ]);
  }
};
