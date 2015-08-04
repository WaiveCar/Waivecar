module.exports = {

  /*
   |--------------------------------------------------------------------------------
   | Payment
   |--------------------------------------------------------------------------------
   |
   | services   : Array of available payment services
   | currencies : Array of supported curriencies
   | stripe     : Stripe service configuration
   |
   */

  payment : {
    services : [ 
      'stripe' 
    ],
    currencies : [
      'usd'
    ],
    stripe : {
      secret : null,
      pub    : null
    }
  }

};