'use strict';

let error = Bento.Error;
let log   = Bento.Log;

// ### Webhooks
// A dictionary of available webhooks for available license services.
let webhooks = {
  onfido : require('./onfido/webhooks')
};

module.exports = class Webhook {

  /**
   * Catches incoming service webhook events.
   * @param  {String} service The service of the incoming webhook
   * @param  {Object} payload The body payload of the webhook.
   * @return {Object}
   */
  static *catch(payload) {
    log.debug(payload);
    if (payload['resource_type'] === 'report' && payload['action'] === 'completed') {
      yield webhooks.onfido.report.receive(payload.object);
    }
  }

};
