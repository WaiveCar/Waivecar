'use strict';

Bento.Error.handler([
  'POST /files',
  'GET  /files'
], (err) => {
  if (err.code === 'Forbidden') {
    err.code    = 'FILE_S3_FORBIDDEN';
    err.message = 'Could not upload image to S3 because of an AWS authentication issue';
  } else if (err.type === 'entity.too.large') {
    err.code    = 'FILE_SIZE_ERROR';
    err.message = 'The file size is too large';
    err.data    = {
      limit : err.limit
    };
  }
  return err;
});
