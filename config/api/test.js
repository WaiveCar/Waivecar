module.exports = {
  api : {
    port : 8082,
    uri  : 'http://localhost:8082'
  },
  log : {
    level : {
      console : 'info',
      file    : 'ignore',
      email   : 'ignore'
    }
  },
  test : {
    custom : [
      'interface/models/user'
    ],
    modules : [
      'auth',
      'user',
      'log'
    ],
    providers : [
      'email',
      'sms'
    ]
  }
};
