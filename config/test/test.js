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
      'email',
      'sms',
      'mysql',
      'gm-api'
    ]
  }

};