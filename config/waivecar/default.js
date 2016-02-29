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
          value : 90,
          type  : 'minutes'
        },
        freeRideExpiration : {
          value : 2,
          type  : 'hours'
        },
        carLocation : {
          value : 30,
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
      coords : [
        [ -118.494651, 34.050775 ],
        [ -118.483794, 34.041583 ],
        [ -118.477206, 34.046757 ],
        [ -118.459074, 34.031536 ],
        [ -118.457808, 34.032016 ],
        [ -118.457122, 34.029883 ],
        [ -118.452852, 34.028122 ],
        [ -118.442895, 34.016171 ],
        [ -118.456929, 34.009465 ],
        [ -118.483386, 33.995288 ],
        [ -118.496776, 34.008416 ],
        [ -118.499393, 34.006744 ],
        [ -118.500724, 34.007775 ],
        [ -118.498235, 34.009234 ],
        [ -118.517311, 34.025081 ],
        [ -118.512526, 34.030523 ],
        [ -118.508770, 34.033243 ],
        [ -118.508148, 34.039343 ],
        [ -118.504565, 34.041227 ],
        [ -118.494673, 34.050704 ]
      ]
    },
    contact : {
      email : 'support@waivecar.com'
    }
  }

};
