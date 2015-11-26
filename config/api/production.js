module.exports = {
  api : {
    port : 3000,
    uri  : 'https://www.waivecar.com',
    cors : {
      origins : [ 'https://www.waivecar.com', 'http://localhost:8080', 'http://localhost:8100' ]
    }
  },
  socket : {
    auth : 'http://localhost:8081/users/me'
  },
  log : {
    level : {
      console : 'error'
    }
  }
};