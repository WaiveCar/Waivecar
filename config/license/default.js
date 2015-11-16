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
    checkr : {
      uri : 'https://api.checkr.com/v1',
      key : '84aaba691da7f191f5922c470a666d372d6d8b3b'
    },
    ui : {
      resources : {
        licenses : require('./resources/licenses')
      },
      fields : {
        licenses : require('./fields/licenses')
      }
    }
  }

};
