import React                 from 'react';
import { Route }             from 'react-router';
import { api, auth }         from 'bento';
import { loader, templates } from 'bento-ui';

// ### Import Templates

let tmpl = require.context('./templates', true, /\.jsx$/);
tmpl.keys().forEach((key) => {
  if (key === './index.jsx') {
    return;
  }
  tmpl(key);
});

// ### Export App

module.exports = {

  /**
   * @property component
   * @type     Component
   */
  component : tmpl('./index.jsx'),

  /**
   * List of modules we want to load into the app, modules loads their own
   * layout and child routes. Check the modules index files for more information
   * on their routes.
   * @property childRoutes
   * @type     Array
   */
  getChildRoutes(state, done) {
    loader((err) => {
      if (err) {
        return done(err);
      }
      api.get('/users/me', function (err, user) {
        if (!err) {
          auth.set(user);
        }
        done((err.status === 404 ? null : err.message), templates.getAll());
      });
    });
  },

  /**
   * Render loading screen while the app is firing up.
   * @method renderInitialLoad
   */
  renderInitialLoad() {
    return <div>Loading...</div>
  }

};
