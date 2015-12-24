module.exports = {
  waivecar : {
    car : {
      staleLimit : 15,
      sync       : {
        value : 1,
        type  : 'hour'
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
