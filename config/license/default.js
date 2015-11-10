module.exports = {

  /*
   |--------------------------------------------------------------------------------
   | License
   |--------------------------------------------------------------------------------
   |
   | @param {Object} ui The bentojs UI configuration.
   |
   */

  license : {
    ui : {
      resources : {
        licenses : require('./resources/licenses')
      },
      fields : {
        licenses : require('./fields/licenses')
      }
    }
  }

};

