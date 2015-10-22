module.exports = {
  name  : 'locations',
  store : {
    key    : 'location',
    method : 'POST',
    uri    : '/locations'
  },
  index : {
    key    : 'locations',
    method : 'GET',
    uri    : '/locations'
  },
  show : {
    key    : 'location',
    method : 'GET',
    uri    : '/locations/:id'
  },
  update : {
    key    : 'location',
    method : 'PUT',
    uri    : '/locations/:id'
  },
  delete : {
    key    : 'location',
    method : 'DELETE',
    uri    : '/locations/:id'
  }
};