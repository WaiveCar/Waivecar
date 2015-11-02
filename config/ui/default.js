'use strict';

let path = require('path');

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
        views    : require('./resources/views')
      },
      fields : {
        views    : require('./fields/views')
      }
    },
    fixtures : {
      views : path.resolve('fixtures', 'views.json')
    }
  }

};