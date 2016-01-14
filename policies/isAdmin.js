'use strict';

let access = Bento.Access;
let error  = Bento.Error;

module.exports = function *isAdmin() {
  access.verifyAdmin(this.auth.user);
};
