'use strict';

import React     from 'react';
import Reach     from 'reach-react';
import policies  from 'interface/policies';
import { Route } from 'react-router';

export default {

  /**
   * @property component
   * @type     Component
   */
  component : require('interface/app'),

  /**
   * List of modules we want to load into the app, modules loads their own
   * layout and child routes. Check the modules index files for more information
   * on their routes.
   * @property childRoutes
   * @type     Array
   */
  childRoutes : [
    require('modules/error'),
    require('modules/auth'),
    require('modules/site'),
    require('modules/app'),
    require('modules/relay')
  ],

  /**
   * Render loading screen while the app is firing up.
   * @method renderInitialLoad
   */
  renderInitialLoad() {
    return <div>Loading...</div>
  }

};