'use strict';

import Reach    from 'reach-react';
import policies from 'interface/policies';

export default {
  component   : require('./layout'),
  childRoutes : [
    {
      path      : '/login',
      onEnter   : policies.isAnonymous,
      component : require('./views/login')
    },
    {
      path      : '/logout',
      onEnter   : function (nextState, transition) {
        Reach.Auth.logout();
        transition.to('/', null);
      }
    }
  ]
};