import { api }    from 'bento';
import resources  from './lib/resources';
import fields     from './lib/fields';
import components from './lib/components';
import apiRoutes from './lib/apiRoutes';
import uiFields from './lib/uiFields';

// ### Component List

let list = require.context('./components', true, /\.jsx$/);

// ### UI Editor

import './editor-template.jsx';

let hasLoaded = false;

// ### Loader

module.exports = function (done) {
  if (hasLoaded) {
    return done(null);
  }
  // ### Load Resources
  // Loads all the available resources defined via config in the api.
  resources.add(apiRoutes);
  // ### Load Fields
  // Loads all the available fields defined via config in the api.
  fields.add(uiFields);

  hasLoaded = true;

  done(null);
}
