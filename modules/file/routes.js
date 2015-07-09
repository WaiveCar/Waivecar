'use strict';

var FileHandler = require('./classes/file-handler');
var Router      = Reach.Router;
var File        = Reach.model('File');

Router.post('/files/:target', {
  handler : function *(target, post) {
    switch (target) {
      case 's3'    : return yield FileHandler.S3.call(this, post, 'reach-storage');
      case 'local' : return yield FileHandler.local(post);
      default:
        this.throw({
          code    : 'FILE_NO_TARGET',
          message : 'You must specify a valid upload target'
        }, 400);
    }
  }
});

Router.get('/files', {
  handler : function *(query) {
    return yield File.find(query);
  }
});