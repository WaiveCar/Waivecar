'use strict';

Reach.Errors.handle('POST /users', function (err) {
  if ('ER_DUP_ENTRY' === err.code) {
    err.status = 400;
    err.data   = {
      email: err.message.match(/Duplicate entry '(.*?)'/)[1]
    };
    err.message = 'The email you entered is already in use';
  }
  return err;
});