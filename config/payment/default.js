module.exports = {

  /*
   |--------------------------------------------------------------------------------
   | Payment
   |--------------------------------------------------------------------------------
   |
   | The various API settings that define how your API reacts to incoming requests.
   |
   | @param {Array}  services   A list of available payment services.
   | @param {Array}  currencies A list of available currencies.
   | @param {Object} stripe     Stripe configuration.
   |
   */

  payment : {
    services   : [ 'stripe' ],
    currencies : [ 'usd' ],
    stripe     : {
      secret : null,
      pub    : null
    },
    ui : {
      resources : {
        cards : require('./resources/cards')
      },
      fields : {
        cards : require('./fields/cards')
      }
    }
  }

};
