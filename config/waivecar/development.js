module.exports = {
  waivecar : {
    car : {
      staleLimit : 30,
      sync       : {
        value : 10,
        type  : 'minutes'
      }
    },
    mock : {
      cars     : false,
      homebase : true,
      stations : true,
      valets   : false
    }
  }
};
