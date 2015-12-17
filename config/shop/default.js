module.exports = {

  /*
   |--------------------------------------------------------------------------------
   | shop
   |--------------------------------------------------------------------------------
   |
   | The various API settings that define how your API reacts to incoming requests.
   |
   | @param {String} service    The service to be used when handling payments.
   | @param {Array}  currencies A list of available currencies.
   | @param {Object} stripe     Stripe configuration.
   |
   */

  shop : {
    service    : 'stripe',
    currencies : [ 'usd' ],
    stripe     : {
      secret : null,
      pub    : null
    }
  }

};
