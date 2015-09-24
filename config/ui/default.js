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
        contents : require('./resources/contents'),
        views    : require('./resources/views')
      },
      fields : {
        contents : require('./fields/contents'),
        views    : require('./fields/views')
      }
    }
  }

};