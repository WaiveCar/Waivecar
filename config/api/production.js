module.exports = {
  api : {
    port : 3000,
    uri  : 'https://lb.waivecar.com'
  },
  redis : {
    host : 'waivecar-dev.xvq4ay.clustercfg.use2.cache.amazonaws.com',
    port : 6379
  },
  socket : {
    api : {
      url   : 'http://localhost:3000',
      me    : '/users/me',
      roles : '/roles'
    }
  }
};
