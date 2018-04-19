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
      parityCheckTimeWindow: 300,
      timers : {
        level: {
          autoCancel : { value : 30, type  : 'minutes' },
          extensionOffer: { value : 27, type  : 'minutes' }
        },
        extensionOffer: { value : 12, type  : 'minutes' },
        autoCancel : { value : 15, type  : 'minutes' },
        extension : { value : 10, type  : 'minutes' },
        freeRideReminder : {
          value : 90,
          type  : 'minutes'
        },
        freeRideExpiration : {
          value : 2,
          type  : 'hours'
        },
        carLocation : {
          value : 120,
          type  : 'seconds'
        },
        forfeitureFirstWarning : {
          value : 5*60,
          type  : 'seconds'
        },
        forfeitureSecondWarning : {
          value : 10*60,
          type  : 'seconds'
        },
        forfeiture : {
          value : 15*60,
          type  : 'seconds'
        }
      }
    },
    car : {
      staleLimit : 60,
      sync       : {
        value : 5,
        type  : 'minutes'
      },
      status : {
        value : 1,
        type  : 'minutes'
      },
      meta : {
        DB000017DC73EA01 : {
          license : 'WAIVE1'
        },
        E5000017DC1E8A01 : {
          license : 'WAIVE2'
        },
        '2E000017DC47E801' : {
          license : 'WAIVE3'
        },
        '2C000017DC44D001' : {
          license : 'WAIVE4'
        },
        D4000017DC3AD101 : {
          license : 'WAIVE5'
        },
        EE000017DC380D01 : {
          license : 'WAIVE6'
        },
        D2000017DC65FC01 : {
          license : 'WAIVE7'
        }
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
    },
    homebase : {
      coords : {
        latitude  : 34.0166784,
        longitude : -118.4914082,
      }
    },
    contact : {
      email : 'support@waive.car'
    }
  }

};
