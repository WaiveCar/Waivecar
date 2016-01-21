Bento.Error.handler([
  'POST /logs/:type'
], (err) => {
  if (err.name === 'SequelizeValidationError') {
    err.code    = 'SEQUELIZE_ERROR';
    err.message = err.errors[0].message;
    err.data    = err.errors[0];
  }
  return err;
});
