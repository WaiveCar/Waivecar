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
        logs : require('./resources/logs')
      },
      fields : {
        logs : require('./fields/logs')
      }
    }
  }
  
};