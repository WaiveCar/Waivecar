'use strict';

module.exports = {

  /*
   |--------------------------------------------------------------------------------
   | UI
   |--------------------------------------------------------------------------------
   |
   | @param {Object} ui       The bentojs UI configuration.
   | @param {String} fixtures Path to UI fixtures.
   |
   */

  ui : {
    ui : {
      resources : {
        bookings     : require('./resources/bookings'),
        cards        : require('./resources/cards'),
        cars         : require('./resources/cars'),
        'error-logs' : require('./resources/error-logs'),
        'event-logs' : require('./resources/event-logs'),
        files        : require('./resources/files'),
        licenses     : require('./resources/licenses'),
        locations    : require('./resources/locations'),
        users        : require('./resources/users'),
        views        : require('./resources/views')
      },
      fields : {
        bookings     : require('./fields/bookings'),
        cards        : require('./fields/cards'),
        cars         : require('./fields/cars'),
        'error-logs' : require('./fields/error-logs'),
        'event-logs' : require('./fields/event-logs'),
        files        : require('./fields/files'),
        licenses     : require('./fields/licenses'),
        locations    : require('./fields/locations'),
        users        : require('./fields/users'),
        views        : require('./fields/views')
      }
    },
    fixtures : {
      views : 'config/ui/fixtures/views.json'
    },
    force : true
  }

};
