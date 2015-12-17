module.exports = {
  api : {
    port : 3000,
    uri  : 'http://localhost:3000'
  },
  socket : {
    api : {
      url   : 'http://localhost:3000',
      me    : '/users/me',
      roles : '/roles'
    }
  },
  web : {
    uri : 'https://waivecar-dev.cleverbuild.biz'
  },
  log : {
    level : {
      console : 'debug',
      file    : 'error',
      email   : 'error'
    }
  }
};
