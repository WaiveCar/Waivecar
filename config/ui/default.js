'use strict';

module.exports = {

  /*
   |--------------------------------------------------------------------------------
   | UI
   |--------------------------------------------------------------------------------
   |
   | ui : Object > UI resources and field settings.
   |
   */

  waivecar : {
    ui : {
      resources : {
        contents : require('./resources/contents')
      },
      fields : {
        contents : require('./fields/contents')
      }
    }
  }

};