module.exports = {
  api : {
    port : 3000,
    uri  : 'https://lb.waivecar.com'
  },
  socket : {
    api : {
      url   : 'http://localhost:3000',
      me    : '/users/me',
      roles : '/roles'
    }
  }
};
