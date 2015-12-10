module.exports = {

  waivecar : {
    car : {
      staleLimit : .25,
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
