'use strict';

let User  = Reach.model('User');
let hooks = Reach.Hooks;
let error = Reach.Error;

hooks.set('auth:user', function *(id, group) {
  let user = yield User.findById(id);
  if (!user) {
    throw error.parse({
      type    : `AUTH_INVALID_USER`,
      message : `The token provided belongs to a user that is no longer accessible.`
    }, 400);
  }
  return user;
});