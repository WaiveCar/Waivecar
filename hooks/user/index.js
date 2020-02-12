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
let intercom     = require('./lib/intercom-service');
let redis        = require('../../modules/waivecar/lib/redis-service');   
let waitlistService = require('../../modules/waivecar/lib/waitlist-service');

// ### Register Jobs

require('./jobs/password-reset');
require('./jobs/registration');

// ### Custom Hooks

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

// this is total bullshit and is not the way you do this.
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

hooks.set('user:store:after', function *(user, _user, opts) {
  opts = opts || {};

  if (user.phone && !user.verifiedPhone && !opts.nosms) {
    yield verification.requestPhoneVerification(user.id, user.phone);
  }

  if(!user.email) {
    user.email = 'Unknown_email_' + user.id + '@waivecar.com';
  }
  //let res = yield intercom.addUser(user);

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
    if ( (nextUser.lastName && nextUser.firstName) &&
         (nextUser.lastName.toLowerCase() !== prevUser.lastName.toLowerCase() || 
          nextUser.firstName.toLowerCase() !== prevUser.firstName.toLowerCase())
      ) {
      if (prevUser.status != 'suspended') {
        nextUser.status = 'pending';
      }
      reason.push(`Name change ${ prevUser.firstName } ${ prevUser.lastName } -> ${ nextUser.firstName } ${ nextUser.lastName }`);
    }

    // During signup the user moves the phone number from null to something valid.
    // We are ok with this - that's what the first check is for (prevUser.phone) - 
    // it's not just there for no reason.
    if (prevUser.phone && nextUser.phone && 
        // Changing unverified phone numbers should come without penalty #770
        // We want to make sure that honest input mistakes during signup don't flag
        // an account but changes of phone numbers at other times should raise an alert.
        //
        // We do this by only raising an alert after it's been verified.  Otherwise
        // we don't care.
        (prevUser.verifiedPhone || reason.length) &&

        prevUser.phone !== nextUser.phone) {

      nextUser.verifiedPhone = false;
      if (prevUser.status != 'suspended') {
        nextUser.status = 'pending';
      }
      reason.push(`Phone number change ${ prevUser.phone } -> ${ nextUser.phone }`);
    }

    if (prevUser.email && prevUser.email !== nextUser.email) {

      nextUser.verifiedEmail = false;
      if (prevUser.status != 'suspended') {
        nextUser.status = 'pending';
      }
      reason.push(`Email change ${ prevUser.email } -> ${ nextUser.email }`);
    }
  }

  if (yield redis.shouldProceed('user-change', prevUser.id)) {
    if (
         (prevUser.status === 'suspended' && reason.length) || 
         (nextUser.status == 'pending' && (prevUser.status == 'active' || reason.length))
       ) {
      let who = '';
      let what = '';

      if(prevUser.status !== nextUser.status && nextUser.status) {
        what = `a previously ${ prevUser.status } user is moving to ${ nextUser.status }`;
        if (prevUser.id == _user.id) {
          who = ' by themselves';
        } else {
          who = ` by ${ _user.name() }`;
        }
      } else {
        what = `a ${ prevUser.status } user, changed some information`;
      }

      if (reason.length) {
        who += ' (' + reason.join(', ') + ')';
      }
      yield UserLog.addUserEvent(prevUser, 'PENDING', _user.id, [reason || []].join(', '));
      yield notify.notifyAdmins(`:construction: ${ prevUser.link() }, ${ what }${ who }`, [ 'slack' ], { channel : '#user-alerts' });
    }
  }
  if (prevUser.status === 'waitlist' && nextUser.status === 'active') { 
    yield waitlistService.FBletIn([prevUser.id], _user);
  }

  return nextUser;
});

hooks.set('user:update:after', function *(user, _user) {
  if (user.phone && !user.verifiedPhone) {
    yield verification.requestPhoneVerification(user.id, user.phone);
  }
});

hooks.set('user:delete:before', function *(user, query, _user) {
  //let res = yield intercom.removeUser(user);
  return true;
});
