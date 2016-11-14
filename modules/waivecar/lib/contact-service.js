'use strict';

let Email   = Bento.provider('email');
let User    = Bento.model('User');
let config  = Bento.config;
let notify  = require('./notification-service');
let request = require('co-request');
let url     = require('url');

module.exports = {
  *deliverMessage(payload, _user) {
    yield notify.slack({ text : `From: ${ _user.name() } <${ _user.email }> ${ _user.info() }\n Subject: ${ payload.subject || '_(none)_' }\n${ payload.message || '_(none)_' }` }, { channel : '#app_support' });
  },

  *deliverSms(payload) {
    let aircall_url = 'https://webhook.frontapp.com/sms/18f55053c49e4d3d27bbc4af0e7d78e97205c88981d8f954579682a382654912';
    let params = url.parse(payload, true);
    let phone = params.query.From;
    let user = yield User.findOne({ where : { phone: phone } });
    let who = user ? user.name() : '_unkonwn_';
    let message = `${ who } (${ phone }): ${ params.query.Body }`;
    yield notify.slack({ text : message }, { channel : '#app_support' });

    params.query.Body = params.query.Body;

    let response = yield request({
      url     : aircall_url,
      method  : 'POST',
      form    : params.query
    });

    return response.body;
  }
  /*,

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
