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
      staleLimit : 60,
      sync       : {
        value : 5,
        type  : 'minutes'
      },
      meta : {
        '2C000017DC44D001' : {
          license : 'WAIVE4'
        },
        '2E000017DC47E801' : {
          license : 'WAIVE3'
        },
        D4000017DC3AD101 : {
          license : 'WAIVE5'
        },
        DB000017DC73EA01 : {
          license : 'WAIVE1'
        },
        E5000017DC1E8A01 : {
          license : 'WAIVE2'
        },
        EE000017DC380D01 : {
          license : 'WAIVE6'
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
    }
  }

};
