module.exports = {

  waivecar : {
    car : {
      staleLimit : 0.25,
      sync       : {
        value : 5,
        type  : 'seconds'
      }
    },
    mock : {
      cars     : false,
      homebase : true,
      stations : true,
      valets   : true
    }
  }

};
