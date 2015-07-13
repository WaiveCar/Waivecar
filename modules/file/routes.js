'use strict';

let FileHandler = require('./classes/file-handler');
let Router      = Reach.Router;

/**
 * Uploads files to the assigned target
 */
Router.post('/files/:target', function *(target, post) {
  switch (target) {
    case 's3'    : return yield FileHandler.S3.call(this, post, 'reach-storage');
    case 'local' : return yield FileHandler.local(post);
    default:
      this.throw({
        code    : 'FILE_NO_TARGET',
        message : 'You must specify a valid upload target'
      }, 400);
  }
});

Router.get('/files/:id', function *(id) {
  return yield FileHandler.stream(this, id);
});