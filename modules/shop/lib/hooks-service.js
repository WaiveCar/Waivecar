'use strict';

let error = Bento.Error;

// ### Webhooks
// A dictionary of available webhooks for available payment services.

let webhooks = {
  stripe : require('./stripe/webhooks')
};

module.exports = class Webhook {

  /**
   * Catches incoming payment service webhook events.
   * @param  {String} service The payment service of the incoming webhook
   * @param  {Object} payload The body payload of the webhook.
   * @return {Object}
   */
  static *catch(service, payload) {
    switch (service) {
      case 'stripe' : {
        return yield Webhook.stripe(payload);
      }
      default : {
        throw error.parse({
          code     : `INVALID_WEBHOOK`,
          message  : `Payments caught an unrecognized webhook from ${ service }`,
          solution : `Make sure the service are calling the API properly.`
        }, 400);
      }
    }
  }

  /**
   * Handles incoming stripe webhooks.
   * @param  {Object} payload
   * @return {Object}
   */
  static *stripe(payload) {
    let event = payload.type.split('.');

    // ### Webhook Type
    // Verify the type of the incoming webhook

    let type = webhooks.stripe[event[0]];
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

    yield webhooks.stripe[event[0]][event[1]](payload);
  }

};
