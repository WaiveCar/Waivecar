'use strict';

export default {
  component   : require('./layout'),
  childRoutes : [
    {
      path      : '/404',
      component : require('./views/404')
    },
    {
      path      : '/500',
      component : require('./views/500')
    }
  ]
};