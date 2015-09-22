'use strict';

import { api }   from 'reach-react';
import resources from './lib/resources';
import fields    from './lib/fields';

// ### UI Components
// Import list of available reach-ui components, these are loaded into
// the ui components store in the component files.

import './components/content';
import './components/form';

// ### Loader

export default function (done) {
  api.get('/ui', (error, result) => {
    if (error) {
      return done(error);
    }

    // ### Load Resources
    // Loads all the available resources defined via config in the api.

    resources.addResources(result.resources);

    // ### Load Fields
    // Loads all the available fields defined via config in the api.

    fields.addFields(result.fields);

    done(null);
  });
}