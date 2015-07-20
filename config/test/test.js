module.exports = {

  /*
   |--------------------------------------------------------------------------------
   | Test
   |--------------------------------------------------------------------------------
   */

  test : {
    custom : [
      'interface/models/user'
    ],
    modules : [
      'auth',
      'user',
      'logger'
    ],
    services : [
      'mysql',
      'gm-api',
      'email',
      'sms'
    ]
  }

};