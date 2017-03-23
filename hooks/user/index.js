'use strict';

let verification = require('./lib/verification');
let UserLog      = require('../../modules/log/lib/log-service');
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
  let reason = [];

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

  if(!_user.hasAccess('admin')) {
    if ( nextUser.lastName  != prevUser.lastName || 
         nextUser.firstName != prevUser.firstName
      ) {
      nextUser.status = 'pending';
      reason.push(`Name change ${ prevUser.firstName } ${ prevUser.lastName } -> ${ nextUser.firstName } ${ nextUser.lastName }`);
    }

    // During signup the user moves the phone number from null to something valid.
    // We are ok with this - that's what the first check is for (prevUer.phone) - 
    // it's not just there for no reason.
    if (prevUser.phone && nextUser.phone && prevUser.phone !== nextUser.phone) {
      nextUser.verifiedPhone = false;
      nextUser.status = 'pending';
      reason.push(`Phone number change ${ prevUser.phone } -> ${ nextUser.phone }`);
    }
  }

  if (nextUser.status == 'pending' && prevUser.status == 'active') {
    let who = '';

    if (prevUser.id == _user.id) {
      who = 'by themselves';
    } else {
      who = `by ${ _user.name() } (#${ _user.id })`;
    }
    
    if (reason.length) {
      who += ' (' + reason.join(', ') + ')';
    }
    yield UserLog.addUserEvent(prevUser, 'PENDING', [reason || []].join(', '));
    yield notify.notifyAdmins(`:construction: ${ prevUser.name() }, a previously active user, has been moved to pending ${ who } | ${ Bento.config.web.uri }/users/${ prevUser.id }`, [ 'slack' ], { channel : '#user-alerts' });
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
