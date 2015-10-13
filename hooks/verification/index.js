'use strict';

let verification = Reach.provider('user-verification');
let User         = Reach.model('User');
let error        = Reach.Error;
let hooks        = Reach.Hooks;

/**
  Send the verification token based on the provided payload.
  
  @hook   verification:send
  @param  {String} token
  @param  {Object} payload
 */
hooks.set('verification:send', function *(token, payload) {
  let user = yield User.findById(payload.user);
  if (!user) {
    throw error.parse({
      code    : 'VERIFICATION_REQUEST_FAILED',
      message : 'Could not find the user to send a verification request to.'
    }, 400);
  }
  if (payload.purpose === 'phone-verification') {
    yield verification.requestPhoneVerification(user.id, user.phone);
  }
  if (payload.purpose === 'email-verification') {
    yield verification.requestEmailVerification(user.id, user.email, user.name());
  }
});

/*
  Verification handler when a token has been verified and awaiting further actions.

  @hook  verification:handle
  @param {Object} payload
 */
hooks.set('verification:handle', function *(payload) {
  let user = yield User.findById(payload.user);
  if (!user) {
    throw error.parse({
      code    : 'VERIFICATION_FAILED',
      message : 'Could not find the user assigned to the token.'
    }, 400);
  }
  yield user.update(() => {
    switch (payload.purpose) {
      case 'phone-verification' : {
        return { verifiedPhone : true, status : (user.status === 'pending' ? 'active' : user.status) }
      }
      case 'email-verification' : {
        return { verifiedEmail : true }
      }
    }
  }());
});