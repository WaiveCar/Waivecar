'use strict';

import Reach    from 'reach-react';
import policies from 'interface/policies';

export default {
  component   : require('./layout'),
  childRoutes : [
    {
      path      : '/login',
      component : require('./views/login'),
      onEnter   : (nextState, transition) => {
        policies.isAnonymous(nextState, transition);
      }
    },
    {
      path    : '/logout',
      onEnter : (nextState, transition) => {
        Reach.Auth.logout();
        transition.to('/', null);
      }
    }
  ]
};