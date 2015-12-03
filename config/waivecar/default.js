module.exports = {

  /*
   |--------------------------------------------------------------------------------
   | WaiveCar
   |--------------------------------------------------------------------------------
   |
   | @param {Object} booking The booking configuration options.
   | @param {Object} ui      The bentojs UI configuration.
   |
   */

  waivecar : {
    booking : {
      timers : {
        autoCancel : {
          value : 15,
          type  : 'minutes'
        },
        freeRideReminder : {
          value : 110,
          type  : 'minutes'
        }
      }
    },
    car : {
      sync : {
        value : 5,
        type  : 'minutes'
      }
    },
    mock : {
      cars     : false,
      homebase : true,
      stations : true,
      valets   : true
    },
    invers : {
      uri     : 'https://api.cloudboxx.invers.com/api',
      headers : {
        'X-CloudBoxx-ApiKey' : 'Ie59GfUgRAQFvUoqGCG5j3QHTpjMWy8Z6L6T1d1KhmD/D9u1lR4lL/p+Rwa3U6Dc',
        Accept               : 'application/json',
        'Content-Type'       : 'application/json'
      }
    }
  }

};
