'use strict';

let tokens       = Bento.provider('token');
let verification = Bento.provider('user-verification');
let User         = Bento.model('User');
let error        = Bento.Error;
let hooks        = Bento.Hooks;

/**
  @hook   verification:send
  @param  {String} type
  @param  {Object} user
  @param  {Object} [payload]
 */
hooks.set('verification:send', function *(type, user, payload) {
  switch (type) {
    case 'phone-verification' : {
      return yield verification.requestPhoneVerification(user.id, user.phone);
    }
    case 'email-verification' : {
      return yield verification.requestEmailVerification(user.id, user.email, user.name());
    }
  }
});

/*
  @hook  verification:handle
  @param {Object} payload
 */
hooks.set('verification:handle', function *(user, payload) {
  yield user.update(() => {
    switch (payload.type) {
      case 'phone-verification' : {
        return { verifiedPhone : true, status : (user.status === 'pending' ? 'active' : user.status) }
      }
      case 'email-verification' : {
        return { verifiedEmail : true }
      }
    }
  }());
});