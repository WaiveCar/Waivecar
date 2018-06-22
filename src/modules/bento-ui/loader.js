import { api }    from 'bento';
import views      from './lib/views';
import resources  from './lib/resources';
import fields     from './lib/fields';
import components from './lib/components';

// ### Component List

let list = require.context('./components', true, /\.jsx$/);

// ### UI Editor

import './editor-template.jsx';

/**
 * @property hasLoaded
 * @type     Boolean
 * @default  false
 */
let hasLoaded = false;

// ### Loader

module.exports = function (done) {
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

    list.keys().forEach((key) => {
      components.register(list(key).build());
    });

    // ### Load Views

    views.add([]);

    // ### Load State

    hasLoaded = true;

    done(null);
  });
}
