'use strict';

let verification = require('./lib/verification');
let bcrypt       = Bento.provider('bcrypt');
let queue        = Bento.provider('queue');
let tokens       = Bento.provider('token');
let User         = Bento.model('User');
let error        = Bento.Error;
let hooks        = Bento.Hooks;
let config       = Bento.config;
let notify       = Bento.module('waivecar/lib/notification-service');

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

let phoneFormat = function(phone) {
  phone = phone.replace(/[^0-9+]/g, '');
  if (phone.startsWith('0')) {
    phone = phone.substring(1);
  }

  if (!phone.startsWith('+1')) {
    if (phone.startsWith('+')) {
      return phone;
    }
    phone = `+1${ phone }`;
  }

  return phone;
};

// ### Store Hooks

/**
 * Provides the data payload for filtering, adjustments etc. for storage requests.
 * @param  {Object} payload
 * @param  {Object} _user
 * @return {Object}
 */
hooks.set('user:store:before', function *(payload, _user) {
  if (payload.phone) {
    payload.phone = phoneFormat(payload.phone);
  }
  return payload;
});

/**
 * Executed after a new user has been sucessfully registered.
 * @param  {Object} user
 * @param  {Object} _user
 * @return {Void}
 */
hooks.set('user:store:after', function *(user, _user) {
  if (user.email && user.email.match(/fixture\.none/gi)) {
    return; // Ignore test accounts...
  }

  // ### Verify Phone

  if (user.phone && !user.verifiedPhone) {
    yield verification.requestPhoneVerification(user.id, user.phone);
  }

  // ### Verify Email

  //
  // if (user.email && !user.verifiedEmail) {
  //  yield verification.requestEmailVerification(user.id, user.email, user.name());
  //}
});

// ### Update Hooks

/**
 * Provides the data payload for filter, adjustments etc. for update requests.
 * @param  {Object} prevUser The previous user data in our database.
 * @param  {Object} nextUser The new user payload provided by client.
 * @param  {Object} _user
 * @return {Object}
 */
hooks.set('user:update:before', function *(prevUser, nextUser, _user) {
  if (nextUser.password) {
    if (!nextUser.oldPassword || !(yield bcrypt.compare(nextUser.oldPassword, prevUser.password))) {
      throw error.parse({
        code    : 'INVALID_CREDENTIALS',
        message : 'The provided credentials does not match any record in our database'
      }, 404);
    }
  }

  if (nextUser.phone) {
    nextUser.phone = phoneFormat(nextUser.phone);
  }

  if (nextUser.phone && prevUser.phone !== nextUser.phone) {
    nextUser.verifiedPhone = false;
  } else {
    nextUser.verifiedPhone = true;
  }

  if (nextUser.status && _user.hasAccess('admin')) {
    // ...
  } else if (!nextUser.verifiedPhone) {
    nextUser.status = 'pending';
  }

  if (nextUser.verifiedPhone) {
    if (!_user.hasAccess('admin')) {
      // if (prevUser.status === 'pending') nextUser.status = 'active';
      delete nextUser.verifiedPhone;
    }
  }

  if (nextUser.status == 'pending' && prevUser.status == 'active') {
    let reason = '';

    if (prevUser.id == _user.id) {
      reason = 'by themselves';
    } else {
      reason = `by ${ _user.name() } (#${ _user.id })`;
    }

    yield notify.notifyAdmins(`${ prevUser.name() } (#${ prevUser.id }), a previously active user, has been moved to pending ${ reason }.`, [ 'slack' ], { channel : '#user-alerts' });
  }

  return nextUser;
});

/**
 * Executed after a user has been successfully updated.
 * @param  {Object} user
 * @param  {Object} _user
 * @return {Void}
 */
hooks.set('user:update:after', function *(user, _user) {
  if (user.phone && !user.verifiedPhone) {
    yield verification.requestPhoneVerification(user.id, user.phone);
  }
});

// ### Delete Hooks

/**
 * Executed before the user is deleted.
 * @param  {Object} user
 * @param  {Object} query The query that was provided with the delete request.
 * @param  {Object} _user
 * @return {Boolean}
 */
hooks.set('user:delete:before', function *(user, query, _user) {
  return true;
});
