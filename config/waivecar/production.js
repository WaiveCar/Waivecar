module.exports = {

  waivecar : {
    car : {
      staleLimit : 30,
      sync       : {
        value : 1,
        type  : 'minute'
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
