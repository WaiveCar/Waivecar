'use strict';

module.exports = {

  /*
   |--------------------------------------------------------------------------------
   | WaiveCar
   |--------------------------------------------------------------------------------
   |
   | ui : Object > WaiveCar resources and field settings.
   |
   */

  waivecar : {
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

