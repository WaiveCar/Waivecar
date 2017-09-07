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
  var payload;
  if (types.isString(type)) {
    payload = {
      type : type,
      data : this.toJSON()
    };
  } else {
    // this makes the sequelize object a simple
    // set of key/value pairs
    let obj = this.toJSON();

    // put any extra stuff on
    Object.assign(obj, type.extra);

    payload = {
      type : type.type,
      data : obj
    };
  }

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

module.exports.extra = function(type, extra) {
}
