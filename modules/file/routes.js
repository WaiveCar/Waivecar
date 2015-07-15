'use strict';

let FileHandler = require('./classes/file-handler');
let Router      = Reach.Router;

/**
 * Uploads files to the assigned target
 */
Router.post('/files/:target', function *(target, post, query) {

  // ### Query
  // Check for possible query params to add to the post

  post.private = query ? query.private : 0;
  post.bucket  = query ? query.bucket  : null;

  // ### Handle
  // Handle the the file upload

  switch (target) {
    case 's3'    : return yield FileHandler.S3.call(this, post);
    case 'local' : return yield FileHandler.local(post);
    default:
      this.throw({
        code    : 'FILE_NO_TARGET',
        message : 'You must specify a valid upload target'
      }, 400);
  }

});

Router.get('/files/:id', function *(id) {
  return yield FileHandler.fetch(this, id);
});