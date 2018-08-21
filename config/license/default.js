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
      uri  : 'https://api.onfido.com/v2/',
      key  : 'test_jNkxF8-E4hfeUiHgNx_OZGtdl4F2ntpS',
      hook : null
    }
    checkr : {
      key : '98413a44829d07166004a0bab8b7535a12f727e6',
      token : '304e6e802f2fb602ae63778bcbfc0a0b0078d05'
    }
  }

};
