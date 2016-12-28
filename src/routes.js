import React                 from 'react';
import async                 from 'async';
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
    async.series([
      loadUI,
      loadRoles,
      loadAuth
    ], (err) => {
      done(err, templates.getAll());
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

/**
 * Loads the authentication roles and assigns to bento.
 * @param  {Function} done
 * @return {Void}
 */
function loadRoles(done) {
  if (!auth.roles().length) {
    api.get('/roles', (err, roles) => {
      if (err) {
        return done(err);
      }
      auth.roles(roles);
      done();
    });
  } else {
    done();
  }
}

/**
 * Checks if there is a auth token set and attempts to retrieve the
 * authenticated user session form the api.
 * @param  {Function} done
 * @return {Void}
 */
function loadAuth(done) {
  let token = auth.token();
  let user  = auth.user();
  if (!user && token) {
    api.get('/users/me', (err, user) => {
      if (!err) {
        auth.set(user);
      }
      done();
    });
  } else {
    done();
  }
}

/**
 * Loads the bento user interface, routes, etc.
 * @return {Void}
 */
function loadUI(done) {
  loader(done);
}
