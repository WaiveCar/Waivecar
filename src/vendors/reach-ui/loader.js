'use strict';

import { api }   from 'reach-react';
import views     from './lib/views';
import resources from './lib/resources';
import fields    from './lib/fields';

// ### UI Editor

import './editor.jsx';

// ### UI Components
// Import list of available reach-ui components, these are loaded into
// the ui components store in the component files.

import './components/content';
import './components/form';
import './components/map';
import './components/mini-chart';
import './components/table';

/**
 * @property hasLoaded
 * @type     Boolean
 * @default  false
 */
let hasLoaded = false;

// ### Loader

export default function (done) {
  if (hasLoaded) {
    return done(null);
  }

  api.get('/ui', (error, result) => {
    if (error) { 
      return done(error); 
    }

    // ### Load Views

    views.add(result.views);

    // ### Load Resources
    // Loads all the available resources defined via config in the api.

    resources.add(result.resources);

    // ### Load Fields
    // Loads all the available fields defined via config in the api.

    fields.add(result.fields);

    // ### Load State

    hasLoaded = true;

    done(null);
  });
}