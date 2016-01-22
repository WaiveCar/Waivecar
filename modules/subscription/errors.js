'use strict';

Bento.Error.handler('POST /subscriptions', (err) => {
  if (err.code === 214) {
    err.code    = 'EMAIL_DUP';
    err.status  = 400;
    err.message = 'You have already subscribed to this mailing list';
  } else {
    err.code    = err.name;
    err.status  = 400;
    err.message = err.error;
  }
  return err;
});
