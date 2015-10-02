'use strict';

let queue  = Reach.provider('queue');
let tokens = Reach.module('user/lib/token-service');
let User   = Reach.model('User');
let hooks  = Reach.Hooks;
let config = Reach.config;

// ### Get Hook
// Triggers when the module needs to retrieve a user based
// on the provided identifier.

hooks.set('user:get', function *(identifier) {
  return yield User.findOne({
    where : {
      email : identifier
    }
  });
});

// ### Store Hook
// Triggers when a new user has been added to the database.

hooks.set('user:stored', function *(user) {
  let job = queue
    .create('email:user:registration', {
      to       : user.email,
      from     : config.email.sender,
      subject  : 'Registration complete',
      template : 'user-welcome-email',
      context  : {
        name    : user.name(),
        company : config.api.name,
        confirm : 'http://local.io:8081/users/email-confirm/sample'
      }
    })
    .save()
  ;
  job.on('complete', () => {
    job.remove();
  });
});

// ### Update Hook
// Triggers when a user has completed an update request.

hooks.set('user:updated', function *(user) {
  // ...
});

// ### Delete Hook
// Triggers when a user has performed a delete request.

hooks.set('user:deleted', function *(user) {
  // ...
});

// ### Verify Hook
// Triggers when a verification request has been made.

hooks.set('user:verify', function *(user, purpose) {
  // ...
});

// ### Password Reset Hook
// Triggered when a password reset token has been generated and
// ready to be sent to the user.

hooks.set('user:send-password-token', function *(user, token, resetUrl) {
  let job = queue
    .create('email:user:password-reset', {
      to       : user.email,
      from     : config.email.sender,
      subject  : 'Password Reset',
      template : 'user-password-reset',
      context  : {
        name      : user.name(),
        service   : config.api.name,
        token     : token,
        resetUrl  : resetUrl
      }
    })
    .save()
  ;
  job.on('complete', () => {
    job.remove();
  });
});
