'use strict';

import { api }    from 'reach-react';
import views      from './lib/views';
import resources  from './lib/resources';
import fields     from './lib/fields';
import components from './lib/components';
import content   from './components/content';
import form      from './components/form';
import map       from './components/map';
import miniChart from './components/mini-chart';
import table     from './components/table';

// ### UI Editor

import './editor.jsx';

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

    // ### Load Resources
    // Loads all the available resources defined via config in the api.

    resources.add(result.resources);

    // ### Load Fields
    // Loads all the available fields defined via config in the api.

    fields.add(result.fields);

    // ### UI Components
    // Import list of available reach-ui components, these are loaded into
    // the ui components store in the component files.
    components.register(content.build());
    components.register(form.build());
    components.register(map.build());
    components.register(miniChart.build());
    components.register(table.build());

    // ### Load Views

    views.add(result.views);

    // ### Load State

    hasLoaded = true;

    done(null);
  });
}