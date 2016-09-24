'use strict';

let Email  = Bento.provider('email');
let config = Bento.config;
let notify       = require('./notification-service');

module.exports = {
  *deliverMessage(payload, _user) {
    yield notify.slack({
      text : `From: ${ _user.name() } <${ _user.email }> ( ${ _user.phone } )\n Subject: ${ payload.subject }\n${ payload.message }`
    }, { channel : '#app_support' });
  }/*,

  *deliverMessageByEmail(payload, _user) {
    let email = new Email();

    yield email.send({
      to       : config.waivecar.contact.email,
      from     : _user.email,
      subject  : 'WaiveCar [Contact]',
      template : 'waivecar-contact',
      context  : {
        message : payload.message,
        subject : payload.subject,
        user    : _user
      }
    });
  }*/
};
