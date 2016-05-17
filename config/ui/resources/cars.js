module.exports = {
  name  : 'cars',
  store : {
    key    : 'car',
    method : 'POST',
    uri    : '/cars'
  },
  index : {
    key    : 'cars',
    method : 'GET',
    uri    : '/cars?limit=100'
  },
  show : {
    key    : 'car',
    method : 'GET',
    uri    : '/cars/:id'
  },
  update : {
    key    : 'car',
    method : 'PUT',
    uri    : '/cars/:id'
  },
  delete : {
    key    : 'car',
    method : 'DELETE',
    uri    : '/cars/:id'
  }
};
