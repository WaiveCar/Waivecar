'use strict';

let bcrypt = Bento.provider('bcrypt');
let User   = Bento.model('User');
let auth   = Bento.Auth;
let hooks  = Bento.Hooks;
let errors = require('./errors');

// ### User Hook

hooks.set('auth:user', function *(id, group) {
  let user = yield User.findById(id);
  if (!user) {
    errors.invalidUser();
  }
  return user;
});

// ### Login Hook

hooks.set('auth:login', function *(identifier, password, options) {
  let user = yield User.findOne({ where : { email : identifier } });
  if (!user) {
    errors.invalidCredentials();
  }

  let validPassword = yield bcrypt.compare(password, user.password);
  if (!validPassword) {
    errors.invalidCredentials();
  }

  user       = user.toJSON();
  user.token = yield auth.token(user.id, options);

  return user;
});
