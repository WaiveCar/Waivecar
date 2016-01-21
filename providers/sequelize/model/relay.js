'use strict';

let relay      = Bento.Relay;
let log        = Bento.Log;
let changeCase = Bento.Helpers.Case;
let types      = Bento.Helpers.Type;

/**
 * Relays the instanced data over the connected web sockets.
 * @param  {String} type       The transmission type create|update|delete.
 * @param  {String} [resource] The resource identifier of the relay.
 * @param  {Object} [user]     The user to send private transmission to.
 * @return {Void}
 */
module.exports = function SequelizeRelay(type, resource, user) {
  let payload = {
    type : type,
    data : this.toJSON()
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
};
