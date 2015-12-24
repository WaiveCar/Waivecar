module.exports = {

  waivecar : {
    car : {
      staleLimit : 15,
      sync       : {
        value : 10,
        type  : 'seconds'
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
