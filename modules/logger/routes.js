'use strict';

let shortid  = require('shortid');
let Router   = Reach.Router;
let ErrorLog = Reach.model('ErrorLog');

Router.post('/logger', function *(post) {
  let ip             = this.request.ip.split(':');
  let log            = new ErrorLog(post);
      log.id         = shortid.generate();
      log.type       = 'web';
      log.clientId   = (this.user) ? this.user.id : 'GUEST';
      log.clientIp   = ip[ip.length - 1];
      log.detailData = JSON.stringify(log.detailData);

  yield log.save();
});

Router.get('/logger', function *(query) {
  return yield ErrorLog.find({
    order  : query.sort   || [ 'createdAt', 'ASC' ],
    limit  : query.limit  || 20,
    offset : query.offset || 0
  });
});