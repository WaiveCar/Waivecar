module.exports = {
  waivecar : {

    // ### Booking
    // Contains setting for how booking behaves.

    booking : {

      // ### Timer
      // Timer set the auto cancellation of an order, it basicaly defines the
      // amount of time the user has to get to their car and start the drive.

      timer : {
        value : 15,
        type  : 'minutes'
      }

    },

    // ### UI
    // Utilized by the reach-ui module to provide dynamic functionality to the
    // front end UI consumer.

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

