'use strict';

import policies from 'interface/policies';

export default {
  component   : require('./layout'),
  childRoutes : [
    {
      path      : 'login',
      onEnter   : policies.isAnonymous,
      component : require('./views/login')
    }
  ]
};