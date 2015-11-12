module.exports = {

  /*
   |--------------------------------------------------------------------------------
   | Log
   |--------------------------------------------------------------------------------
   |
   | @param {Boolean} email     Set if the module should send out error logs via
   |                            email.
   | @param {Array}   developer A list of developer email to receive emails.
   | @param {Object}  ui        The bentojs UI configuration.
   |
   */

  logger : {
    email      : false,
    developers : [],
    ui         : {
      resources : {
        'error-logs' : require('./resources/error-logs'),
        'event-logs' : require('./resources/event-logs')
      },
      fields : {
        'error-logs' : require('./fields/error-logs'),
        'event-logs' : require('./fields/event-logs')
      }
    }
  }

};
