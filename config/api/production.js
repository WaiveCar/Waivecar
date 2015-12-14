module.exports = {
  api : {
    port : 3000,
    uri  : 'https://www.waivecar.com',
    cors : {
      origins : [ 'https://www.waivecar.com', 'http://localhost:8080', 'http://localhost:8100' ]
    }
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
      console : 'error'
    }
  }
};