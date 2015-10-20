module.exports = {
  name  : 'logs',
  store : {
    method : 'POST',
    uri    : '/logs'
  },
  index : {
    method : 'GET',
    uri    : '/logs'
  },
  show : {
    method : 'GET',
    uri    : '/logs/:id'
  },
  update : {
    method : 'PUT',
    uri    : '/logs/:id'
  },
  delete : {
    method : 'DELETE',
    uri    : '/logs/:id'
  }
};