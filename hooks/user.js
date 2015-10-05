'use strict';

let queue  = Reach.provider('queue');
let tokens = Reach.module('user/lib/token-service');
let User   = Reach.model('User');
let hooks  = Reach.Hooks;
let config = Reach.config;

function *requestPhoneVerification(userId, phone) {
  let token = yield tokens.get({
    id      : userId,
    purpose : 'phone-verification'
  });

  let job = queue.create('sms:user:request-phone-verification', {
    to      : phone,
    message : `WaiveCar: Your verification code is ${ token }. Do not reply by SMS.`
  }).save();

  job.on('complete', () => {
    job.remove();
  });
}

function *requestEmailVerification(userId, email, name) {
  let token = yield tokens.get({
    id      : userId,
    purpose : 'email-verification'
  });

  let job = queue.create('sms:user:request-email-verification', {
    to       : email,
    from     : config.email.sender,
    subject  : 'Email Verificaton Required',
    template : 'request-email-verification',
    context  : {
      name    : name,
      token   : token,
      company : config.api.name,
      confirm : `${ config.api.uri }/users/verify`
    }
  }).save();

  job.on('complete', () => {
    job.remove();
  });
}

/**
 * Return a user based on the provided identifier.
 * @hook   user:get
 * @param  {Mixed} identifier
 * @return {User}
 */
hooks.set('user:get', function *(identifier) {
  return yield User.findOne({
    where : {
      email : identifier
    }
  });
});

/**
 * Triggers after a user has been successfully stored, this hook
 * is generaly usefull for sending notifications to the user
 * such as a welcome or further account instructions.
 * @hook  user:stored
 * @param {User} user
 */
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

  if (user.phone && !user.verifiedPhone) {
    yield requestPhoneVerification(user.id, user.phone);
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
    yield requestPhoneVerification(user.id, user.phone);
  }
  if (user.email && !user.verifiedEmail) {
    yield requestEmailVerification(user.id, user.email, user.name());
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
 * Triggers when a token has been verified passing the user
 * and verification purpose.
 * @hook  user:verified
 * @param {User}   user
 * @param {String} purpose
 */
hooks.set('user:verified', function *(user, purpose) {
  yield user.update(() => {
    switch (purpose) {
      case 'phone-verification' : {
        return { verifiedPhone : true }
      }
      case 'email-verification' : {
        return { verifiedEmail : true }
      }
    }
  }());
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
