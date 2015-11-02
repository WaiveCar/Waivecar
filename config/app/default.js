module.exports = {

  /*
   |--------------------------------------------------------------------------------
   | APP Settings
   |--------------------------------------------------------------------------------
   |
   | name        : String > The name/title of the application
   | version     : String > The version of the application
   | uri         : String > The root address endpoint of the app
   | port        : String > The port the app is running on
   | log         : Object > Application log settings
   | description : Array  > The application description
   |
   */

  app : {
    name        : 'WaiveCar',
    version     : '0.0.1',
    environment : 'development',
    uri         : 'http://localhost',
    port        : 8080,
    log         : {
      silly   : false,
      debug   : false,
      verbose : false,
      info    : false,
      warn    : false,
      error   : true
    },
    description : [
      'WaiveCar',
      'Fleet Management'
    ]
  },

  web : {
    components : {
      map : {
        key : '8698d318586c58a1f8ca1e88ecfac299'
      }
    }
  }

};
