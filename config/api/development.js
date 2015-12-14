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
  log : {
    level : {
      console : 'debug',
      file    : 'error',
      email   : 'error'
    }
  }
};
