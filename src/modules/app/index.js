'use strict';

import Reach      from 'reach-react';
import UI         from 'reach-ui';
import { views }  from 'reach-ui';
import policies   from 'interface/policies';

// ### Static Routes
// Routes that are currently not dynamic.

views.addRoute({
  path      : '/past-rides',
  component : require('./views/past-rides')
});

// ### Export
// Expor the application module routes.

export default  {
  onEnter   : policies.isAuthenticated,
  component : require('./layout'),

  /**
   * @method getChildRoutes
   * @param  {Object}   state
   * @param  {Function} done
   */
  getChildRoutes(state, done) {
    if (UI.loaded) {
      return done(null, views.getRoutes());
    }
    if (!Reach.Auth.check()) {
      return done(null, views.getRoutes());
    }
    UI.load(done);
  }

};