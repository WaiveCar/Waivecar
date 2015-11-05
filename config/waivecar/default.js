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
      timer : {
        value : 15,
        type  : 'minutes'
      }
    },

    ui : {
      resources : {
        bookings  : require('./resources/bookings'),
        cars      : require('./resources/cars'),
        locations : require('./resources/locations')
      },
      fields : {
        bookings  : require('./fields/bookings'),
        cars      : require('./fields/cars'),
        locations : require('./fields/locations')
      }
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
