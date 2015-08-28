'use strict';

import React     from 'react';
import Reach     from 'reach-react';
import policies  from 'interface/policies';
import { Route } from 'react-router';

export default {

  /**
   * Render loading screen while the app is firing up.
   * @method renderInitialLoad
   */
  renderInitialLoad() {
    return <div>Loading...</div>
  },

  /**
   * List of modules we want to load into the app, modules loads their own
   * layout and child routes. Check the modules index files for more information
   * on their routes.
   * @property childRoutes
   * @type     Array
   */
  childRoutes: [
    {
      component   : require('interface/components/app'),
      childRoutes : [
        // {
        //   path    : '/',
        //   onEnter : function (nextState, transition) {
        //     transition.to('/dashboard', null);
        //   }
        // },
        {
          path    : '/logout',
          onEnter : function (nextState, transition) {
            Reach.Auth.del();
            transition.to('/login', null);
          }
        },
        {
          path      : '/404',
          component : require('interface/components/404')
        },
        {
          path      : '/500',
          component : require('interface/components/500')
        },
        require('modules/auth'),
        require('modules/site'),
        require('modules/admin'),
        require('modules/redux')
      ]
    }
  ]

};