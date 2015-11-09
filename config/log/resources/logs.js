module.exports = {
  name  : 'logs',
  store : {
    method : 'POST',
    uri    : '/logs'
  },
  index : {
    method : 'GET',
    uri    : '/logs/koa'
  },
  delete : {
    method : 'DELETE',
    uri    : '/logs/:id'
  }
};