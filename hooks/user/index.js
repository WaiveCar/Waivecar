'use strict';

let queue        = Bento.provider('queue');
let tokens       = Bento.provider('token');
let verification = Bento.provider('user-verification');
let User         = Bento.model('User');
let error        = Bento.Error;
let hooks        = Bento.Hooks;
let config       = Bento.config;

// ### Register Jobs

require('./jobs/password-reset');
require('./jobs/registration');

// ### Custom Hooks

/**
 * Retrieves a user based on provided identifier.
 * @param {String} identifier
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
 * Triggers when a token has been verified passing the user and verification purpose.
 * @param  {Object} user
 * @param  {String} purpose
 * @return {Void}
 */
hooks.set('user:verified', function *(user, purpose) {
  // ...
});

/**
 * Hook for sending out password reset tokens when password reset request has been
 * successfully placed.
 * @param  {Object} user
 * @param  {String} token
 * @param  {String} resetUrl
 * @return {Void} [description]
 */
hooks.set('user:send-password-token', function *(user, token, resetUrl) {
  let job = queue
    .create('email:user:password-reset', {
      to       : user.email,
      from     : config.email.sender,
      subject  : 'Password Reset',
      template : 'user-password-reset',
      context  : {
        name     : user.name(),
        service  : config.api.name,
        token    : token,
        resetUrl : resetUrl
      }
    })
    .save()
  ;
  job.on('complete', () => {
    job.remove();
  });
});

// ### Store Hooks

/**
 * Provides the data payload for filtering, adjustments etc. for storage requests.
 * @param  {Object} payload
 * @return {Object}
 */
hooks.set('user:store:before', function *(payload) {
  return payload;
});

/**
 * Executed after a new user has been sucessfully registered.
 * @param  {Object} user
 * @return {Void}
 */
hooks.set('user:store:after', function *(user) {
  if (user.email.match(/fixture\.none/gi)) {
    return; // Ignore test accounts...
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

// ### Update Hooks

/**
 * Provides the data payload for filter, adjustments etc. for update requests.
 * @param  {Object} prevUser The previous user data in our database.
 * @param  {Object} nextUser The new user payload provided by client.
 * @return {Object}
 */
hooks.set('user:update:before', function *(prevUser, nextUser) {
  return nextUser;
});

/**
 * Executed after a user has been successfully updated.
 * @param  {Object} user
 * @return {Void}
 */
hooks.set('user:update:after', function *(user) {
  if (user.phone && !user.verifiedPhone) {
    yield verification.requestPhoneVerification(user.id, user.phone);
  }
  if (user.email && !user.verifiedEmail) {
    yield verification.requestEmailVerification(user.id, user.email, user.name());
  }
});

// ### Delete Hooks

/**
 * Executed before the user is deleted.
 * @param  {Object} user
 * @param  {Object} query The query that was provided with the delete request.
 * @return {Boolean}
 */
hooks.set('user:delete:before', function *(user, query) {
  return true;
});
