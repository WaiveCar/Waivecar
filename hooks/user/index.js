'use strict';

let queue        = Reach.provider('queue');
let tokens       = Reach.provider('token');
let verification = Reach.provider('user-verification');
let User         = Reach.model('User');
let error        = Reach.Error;
let hooks        = Reach.Hooks;
let config       = Reach.config;

// ### Register Jobs

require('./jobs/password-reset');
require('./jobs/registration');

/**
 * Return a user based on the provided identifier.
 * @hook   user:get
 * @param  {Mixed} identifier
 * @return {User}
 */
hooks.set('user:get', function *(identifier) {
  let user = yield User.findOne({
    where : {
      email : identifier
    }
  });
  if (!user) {
    throw error.parse({
      code    : 'INVALID_CREDENTIALS',
      message : 'The provided credentials does not match any record in our database'
    }, 404);
  }
  return user;
});

/**
 * Triggers after a user has been successfully stored, this hook
 * is generaly usefull for sending notifications to the user
 * such as a welcome or further account instructions.
 * @hook  user:stored
 * @param {User} user
 */
hooks.set('user:stored', function *(user) {

  // ### Test Accounts
  // Ignore accounts created as a fixture.

  if (user.email.match(/fixture\.none/gi)) {
    return;
  }

  // ### Registration Job

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

  // ### Verify Phone

  if (user.phone && !user.verifiedPhone) {
    yield verification.requestPhoneVerification(user.id, user.phone);
  }

  // ### Verify Email

  if (user.email && !user.verifiedEmail) {
    yield verification.requestEmailVerification(user.id, user.email, user.name());
  }
});

/**
 * Triggers after a user has successfully updated their account
 * with new information.
 * @hook  user:updated
 * @param {User} user
 */
hooks.set('user:updated', function *(user) {
  if (user.phone && !user.verifiedPhone) {
    yield verification.requestPhoneVerification(user.id, user.phone);
  }
  if (user.email && !user.verifiedEmail) {
    yield verification.requestEmailVerification(user.id, user.email, user.name());
  }
});

/**
 * Triggers after a user was successfully deleted, by default
 * the system soft-deletes data.
 * @hook  user:deleted
 * @param {User} user
 */
hooks.set('user:deleted', function *(user) {
  // ...
});

/**
 * Hook for sending out password reset tokens when password
 * reset request has been successfully placed.
 * @hook  user:send-password-token
 * @param {User}   user
 * @param {String} token
 * @param {String} resetUrl
 */
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
