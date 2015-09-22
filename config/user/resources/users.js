module.exports = {
  store : {
    key    : 'user',
    method : 'POST',
    uri    : '/users'
  },
  index : {
    key    : 'users',
    method : 'GET',
    uri    : '/users'
  },
  show : {
    key    : 'user',
    method : 'GET',
    uri    : '/users/:id'
  },
  update : {
    key    : 'user',
    method : 'PUT',
    uri    : '/users/:id'
  },
  delete : {
    key    : 'user',
    method : 'DELETE',
    uri    : '/users/:id'
  }
};