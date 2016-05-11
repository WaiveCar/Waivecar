module.exports = {
  api : {
    port : 3000,
    uri  : 'https://waive.car'
  },
  socket : {
    api : {
      url   : 'http://localhost:3000',
      me    : '/users/me',
      roles : '/roles'
    }
  }
};
