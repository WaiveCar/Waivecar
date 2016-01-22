'use strict';

let error       = Bento.Error;
let config      = Bento.config.subscription;
let transporter = Bento.isTesting() ? null : mailchimp();

module.exports = {

  *store(data) {
    let req = {
      id    : config.mailchimp.list,
      email : {
        email : data.email
      }
    };
    return yield new Promise((resolve, reject) => {
      transporter.lists.subscribe(req, (res) => resolve(res), (err) => reject(err));
    });
  }

};

/**
 * Returns the mailchimp transporter.
 * @return {Object}
 */
function mailchimp() {
  if (!config.mailchimp) {
    throw error.parse({
      code     : 'SUBSCRIPTIONS_MAILCHIMP_CONFIG',
      message  : 'Missing configuration for subscription service [Mailchimp]',
      solution : 'Make sure to set up the correct configuration for your Mailchimp account'
    });
  }
  if (!config.mailchimp.key) {
    throw error.parse({
      code     : 'SUBSCRIPTIONS_MAILCHIMP_CONFIG',
      message  : 'Missing API Key for subscription service [Mailchimp]',
      solution : 'Make sure to set up the correct configuration for your Mailchimp account'
    });
  }
  if (!config.mailchimp.list) {
    throw error.parse({
      code     : 'SUBSCRIPTIONS_MAILCHIMP_CONFIG',
      message  : 'Missing List Id for subscription service [Mailchimp]',
      solution : 'Make sure to set up the correct configuration for your Mailchimp account'
    });
  }
  let mc = require('mailchimp-api');
  return new mc.Mailchimp(config.mailchimp.key);
}
