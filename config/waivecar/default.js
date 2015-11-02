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
    }
  }

};

