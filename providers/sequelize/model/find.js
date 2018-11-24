'use strict';

let Relations = require('../helpers').Relations;
let relay      = Bento.Relay;
let log        = Bento.Log;
let changeCase = Bento.Helpers.Case;
let types      = Bento.Helpers.Type;

module.exports = function *find(options) {
  let relations = new Relations(this, options);
  let result    = yield this._schema.findAll(options);
  if (!result) {
    return null;
  }
  for (let i = 0, len = result.length; i < len; i++) {
    let data = result[i].dataValues;
    if (relations.exists) {
      relations.prepare(data);
    }
    result[i] = new this(data);
  }

  // ### Append Relay
  // Add relay features to the resulting array for easier relay transmissions.

  result.relay = sequelizeRelay.bind(this, result);

  return result;
};

/**
 * Sends a data array of object over the relay.
 * @param  {Array}  data
 * @param  {String} type
 * @param  {String} [resource]
 * @param  {Object} [user]
 * @return {Void}
 */
function sequelizeRelay(data, type, resource, user) {
  let payload = {
    type : type,
    data : data
  };

  // ### Optional Arguments

  if (types.isObject(resource)) {
    user     = resource;
    resource = this._resource;
  } else {
    resource = resource || this._resource;
  }

  // ### Emit
  // If a user is provided the relay emission is treated as a private
  // transmission and is only served to the user provided and admins.

  if (user) {
    relay.user(user.id, resource, payload);
    relay.admin(resource, payload);
  } else {
    relay.emit(resource, payload);
  }

  if (!Bento.isTesting()) {
    // log.debug(`Relay [${ resource }:${ type }][...${ resource }]`);
  }
}
