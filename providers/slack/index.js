'use strict';

let request = require('co-request');
let log     = Bento.Log;
let config  = Bento.config.slack;

module.exports = class Slack {

  /**
   * Creates a new slack insance against the provided channel.
   * @param  {String} channel The slack channel to interact with.
   */
  constructor(channel) {
    if (!config) {
      throw error.parse({
        code     : `SLACK_MISSING_CONFIG`,
        message  : `Slack configuration has not been registered with the API.`,
        solution : `Make sure that a default, and environment configuration has been set.`
      });
    }

    let channels = config.channels;

    // ### Assign Token
    // Checks the configuration for the requested channel to assign the
    // slack generated access token.

    if (!channels[channel]) {
      log.warn(`The requested channel '${ channel }' has not been defined in the slack configuration.`);
    }

    this.webhook  = channels[channel];
  }

  /**
   * Attempts to send a message via the channel webhook.
   * @param {Object} msg
   */
  *message(msg, params) {
    let url = this.webhook;
    if (params && params.channel) {
      if (!config.channels[params.channel]) {
        log.warn(`The requested channel '${ params.channel }' has not been defined in the slack configuration.`);
      } else {
        url = config.channels[params.channel];
      }
    }

    let res = yield request({
      method : 'POST',
      url    : url,
      body   : msg,
      json   : true
    });
    if (res.statusCode !== 200) {
      throw error.parse({
        code    : `SLACK_MESSAGE_FAILED`,
        message : `A slack message came back with an error.`,
        data    : {
          message : msg,
          result  : res.body
        }
      }, res.statusCode);
    }
  }

};
