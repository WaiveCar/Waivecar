'use strict';

import { API } from 'reach-react';

/**
 * @class UI
 */
let UI = module.exports = {};

/**
 * @property loaded
 * @type     Boolean
 * @default  false
 */
UI.loaded = false;

/**
 * @property resources
 * @type     Resources
 */
UI.resources = require('./lib/resources');

/**
 * @property fields
 * @type     Fields
 */
UI.fields = require('./lib/fields');

/**
 * @property components
 * @type     Components
 */
UI.components = require('./lib/components');

/**
 * @property views
 * @type     Views
 */
UI.views = require('./lib/views');

/**
 * @property menu
 * @type     Menu
 */
UI.menu = require('./lib/menu');

/**
 * @method load
 * @param  {Function} done
 */
UI.load = function (done) {
  API.get('/ui', (err, res) => {
    if (err) {
      return done(err);
    }

    // ### Loaded
    // Set the loaded status to true as we only load the UI once.

    this.loaded = true;

    // ### Prepare UI

    this.resources  (res.resources);
    this.fields     (res.fields);
    this.components (res.components);
    this.views      (res.views)

    // ### Done

    done(null, this.views.getRoutes());
  }.bind(this));
};

/**
 * @private
 * @method prepareUi
 * @param  {Object}   ui
 * @param  {Function} done
 */
function prepareUi(ui, done) {

  /*
  for (let key in ui.views) {
    let module = ui.views[key];
    routes.push({
      childRoutes : routes(module)
    });
  }
  done(null, routes);
  */

  done(null, []);
}