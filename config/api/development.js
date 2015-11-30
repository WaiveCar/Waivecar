module.exports = {
  api : {
    port : 3000,
    uri  : 'http://localhost:3000',
    cors : {
      origins : '*'
    }
  },
  socket : {
    auth : 'http://localhost:3000/users/me'
  },

  log : {
    level : {
      console : 'debug',
      file    : 'error',
      email   : 'error'
    }
  }

};
