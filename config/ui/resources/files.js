module.exports = {
  name  : 'files',
  store : {
    method : 'POST',
    uri    : '/files'
  },
  index : {
    method : 'GET',
    uri    : '/files'
  },
  show : {
    method : 'GET',
    uri    : '/files/:id'
  },
  update : {
    method : 'PUT',
    uri    : '/files/:id'
  },
  delete : {
    method : 'DELETE',
    uri    : '/files/:id'
  }
};