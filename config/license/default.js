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
      uri : 'https://api.onfido.com/v1/',
      key : 'test_jNkxF8-E4hfeUiHgNx_OZGtdl4F2ntpS'
    },
    checkr : {
      uri : 'https://api.checkr.com/v1',
      key : '84aaba691da7f191f5922c470a666d372d6d8b3b'
    }
  }

};
