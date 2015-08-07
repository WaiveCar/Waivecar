'use strict';

let config = Reach.config.sequelize;
let User   = Reach.model('User');

module.exports = function (app) {
  app.use(function *(next) {
    if (this.auth.check()) {
      this._actor = this.auth.user;
    } else {
      this._actor = yield User.findOne({
        where : {
          email : config._super.email,
        }
      });
    }
    yield next;
  });
};