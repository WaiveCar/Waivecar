'use strict';

let error = Bento.Error;

// ### Webhooks
// A dictionary of available webhooks for available license services.
let webhooks = {
  checkr : require('./checkr/webhooks')
};

module.exports = class Webhook {

  /**
   * Catches incoming service webhook events.
   * @param  {String} service The service of the incoming webhook
   * @param  {Object} payload The body payload of the webhook.
   * @return {Object}
   */
  static *catch(service, payload) {
    switch (service) {
      case 'checkr' : {
        return yield Webhook.checkr(payload);
      }
      default : {
        throw error.parse({
          code     : `INVALID_WEBHOOK`,
          message  : `Licenses caught an unrecognized webhook from ${ service }`,
          solution : `Make sure the service are calling the API properly.`
        }, 400);
      }
    }
  }

  /**
   * Handles incoming webhooks.
   * @param  {Object} payload
   * @return {Object}
   */
  static *checkr(payload) {
    console.log(payload);
    let event = payload.type.split('.');

    // ### Webhook Type
    // Verify the type of the incoming webhook
    let type = webhooks.checkr[event[0]];
    if (!type) {
      throw error.parse({
        code    : `INVALID_WEBHOOK_TYPE`,
        message : `The webhook type '${ event[0] }' is not supported.`
      }, 400);
    }

    // ### Webhook Methods
    // Verify that the type.method has been defined.
    let method = type[event[1]];
    if (!method) {
      throw error.parse({
        code    : `INVALID_WEBHOOK_EVENT`,
        message : `No action has been enabled for catching '${ payload.type }' events.`
      }, 400);
    }

    // ### Run Hook
    yield webhooks.checkr[event[0]][event[1]](payload);
  }

};
