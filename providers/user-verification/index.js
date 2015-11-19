'use strict';

let queue  = Bento.provider('queue');
let tokens = Bento.provider('token');
let config = Bento.config;

// ### Require Verification Jobs

require('./jobs/request-email-verification');
require('./jobs/request-phone-verification');

module.exports = class UserVerification {

  /**
   * Creates and sends a new phone verification request.
   * @param  {Mixed}  id
   * @param  {String} phone
   * @return {Void}
   */
  static *requestPhoneVerification(id, phone) {
    let token = yield tokens.create({
      user        : id,
      type        : 'phone-verification',
      tokenType   : 'base10',
      tokenLength : 6
    });

    let job = queue.create('sms:user:request-phone-verification', {
      to      : phone,
      message : `WaiveCar: Your verification code is ${ token }. Do not reply by SMS.`
    }).save();

    job.on('complete', () => {
      job.remove();
    });
  }

  /**
   * Creates and sends a new email verification request.
   * @param  {Mixed}  id
   * @param  {String} email
   * @param  {String} name
   * @return {Void}
   */
  static *requestEmailVerification(id, email, name) {
    let token = yield tokens.create({
      user        : id,
      type        : 'email-verification',
      tokenType   : 'base10',
      tokenLength : 6
    });

    let job = queue.create('email:user:request-email-verification', {
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

};
