/**
 * New Relic agent configuration.
 *
 * See lib/config.defaults.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {

  /**
   * Array of application names.
   */
  app_name: [ 'WaiveCar' ],

  /**
   * Your New Relic license key.
   */
  license_key : '7d40f83ec1c0ad7d4dfacfc164cb9977d7436968',

  logging : {

    /**
     * Level at which to log. 'trace' is most useful to New Relic when diagnosing
     * issues with the agent, 'info' and higher will impose the least overhead on
     * production applications.
     */
    level : 'info'

  }

};
