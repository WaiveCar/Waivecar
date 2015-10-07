'use strict';

let bcrypt = Reach.provider('bcrypt');
let User   = Reach.model('User');
let auth   = Reach.Auth;
let hooks  = Reach.Hooks;
let error  = Reach.Error;

// ### User Hook

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

// ### Login Hook

hooks.set('auth:login', function *(identifier, password, options) {
  let user = yield User.findOne({ where : { email : identifier }});
  if (!user) {
    throw error.parse({
      type    : 'AUTH_INVALID_CREDENTIALS',
      message : 'The email and/or password provided is invalid.'
    }, 400);
  }

  let validPassword = yield bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw error.parse({
      type    : 'AUTH_INVALID_CREDENTIALS',
      message : 'The email and/or password provided is invalid.'
    }, 400);
  }

  user       = user.toJSON();
  user.token = yield auth.token(user.id, options);

  return user;
});