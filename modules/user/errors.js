'use strict';

Bento.Error.handler('POST /users', (err) => {
  if (err.code === 'SEQUELIZE_SAVE_ERROR' && err.data.type === 'UNIQUE_VIOLATION') {
    err.code    = `USER_DUPLICATE`;
    err.status  = 400;
    err.message = `A unique constraint error occured during registration.`;
    err.data    = err.fields;
  }
  return err;
});
