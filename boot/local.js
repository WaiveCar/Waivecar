/*jshint camelcase: false */

// This configuration file is specific to each developer's environment,
// and will merge on top of all other settings from ./config.js
// (but only will merge in development environment)
exports = module.exports = function() {
  return {
    cache: false,
    bypassSecurity: true,
    cleanOnRestart: true,
    server: {
      host: '0.0.0.0',
      port: 3000
    },
    admin: {
      email: 'john.smith@example.com',
      password: 'lollipop0',
      firstName: 'Site',
      lastName: 'Administrator'
    }
  };
};

exports['@singleton'] = true;