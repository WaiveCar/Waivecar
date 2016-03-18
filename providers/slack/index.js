'use strict';

let request = require('co-request');
let log     = Bento.Log;
let config  = Bento.config.slack;
let error   = Bento.Error;

module.exports = class Slack {

  /**
   * Creates a new slack insance against the provided channel.
   */
  constructor() {
    if (!config) {
      throw error.parse({
        code     : `SLACK_MISSING_CONFIG`,
        message  : `Slack configuration has not been registered with the API.`,
        solution : `Make sure that a default, and environment configuration has been set.`
      });
    }

    this.webhook  = config.default;
    log.info(`[SLACK] Using slack webhook: ${ this.webhook }`);
  }

  /**
   * Attempts to send a message via the channel webhook.
   * @param {Object} msg
   */
  *message(msg, params) {
    let url = this.webhook;

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
