'use strict';

let config = Reach.config.mysql;
let User   = Reach.model('User');

module.exports = function (app) {
  app.use(function *(next) {
    if (this.auth.check()) {
      this._actor = this.auth.user;
    } else {
      this._actor = yield User.find({
        where : {
          email : config._super.email,
        },
        limit : 1
      });
    }
    yield next;
  });
};