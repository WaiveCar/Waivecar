'use strict';

import React         from 'react';
import Reach         from 'reach-react';
import policies      from 'interface/policies';
import { Route }     from 'react-router';
import { templates } from 'reach-ui';

// ### Load UI

import 'reach-ui/load';

// ### Import Templates

import './templates/site';
import './templates/auth';
import './templates/app';

// ### Export App

export default {

  /**
   * @property component
   * @type     Component
   */
  component : require('./templates/index'),

  /**
   * List of modules we want to load into the app, modules loads their own
   * layout and child routes. Check the modules index files for more information
   * on their routes.
   * @property childRoutes
   * @type     Array
   */
  childRoutes : templates.getAll(),

  /**
   * Render loading screen while the app is firing up.
   * @method renderInitialLoad
   */
  renderInitialLoad() {
    return <div>Loading...</div>
  }

};