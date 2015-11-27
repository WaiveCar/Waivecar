module.exports = {

  /*
   |--------------------------------------------------------------------------------
   | License
   |--------------------------------------------------------------------------------
   |
   | The various API settings that define how your API reacts to incoming requests.
   |
   | @param {Array}  services A list of available license verification services.
   | @param {Object} checkr   Checkr configuration.
   |
   */

  license : {
    onfido : {
      uri  : 'https://api.onfido.com/v1/',
      key  : null,
      hook : null
    }
  }

};
