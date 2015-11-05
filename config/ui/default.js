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
        views : require('./resources/views')
      },
      fields : {
        views : require('./fields/views')
      }
    },
    fixtures : {
      views : 'config/ui/fixtures/views.json'
    },
    force : true
  }

};
