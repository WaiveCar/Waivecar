'use strict';

let config = require('config');
let auth   = require('./auth');
let relay  = require('./relay');
let socket = getSocket();

class Socket {

  /**
   * Event listener.
   * @param  {...Mixed} args
   * @return {Void}
   */
  static on(...args) {
    if (!socket) {
      return console.warn(`Socket > Service has not been configured with this application.`);
    }
    socket.on(...args);
  }

  /**
   * Emit an event on the socket.
   * @param  {...Mixed} args
   * @return {Void}
   */
  static emit(...args) {
    if (!socket) {
      return console.warn(`Socket > Service has not been configured with this application.`);
    }
    socket.emit(...args);
  }

  /**
   * Authenticate with the socket.
   * @param  {String} token
   * @return {Void}
   */
  static authenticate(token) {
    this.emit('authenticate', token, (error) => {
      if (error) {
        return console.warn(`Socket > An error occured when attempting to authenticate the socket.`);
      }
      console.log(`Socket > Successfully authenticated with the socket.`);
    });
  }

}

/**
 * Returns a new socke tinstance base don the configuration set
 * in the application.
 * @return {Object}
 */
function getSocket() {
  let settings = config.api.socket;

  // ### Validate Config
  // Check if socket configuration has been defined.

  if (!settings) {
    return null;
  }

  // ### Connect
  // Attempt to connect to the socket with the socket configuration provided.

  if (typeof settings === 'object') {
    if (settings.uri && settings.options) {
      return io(settings.uri, settings.options);
    } else if (settings.uri) {
      return io(settings.uri);
    }
  }
  return io(settings);
}

// ### Socket Events

if (socket) {

  // ### Connect
  // Check auth status on connection and attempt to authenticate the socket
  // if a token was found.

  socket.on('connect', () => {
    if (auth.check()) {
      Socket.authenticate(auth.token());
    } else {
      console.log(`Socket > Connected as guest.`);
    }
  });

  // ### Relay
  // Dispatch relay events.

  socket.on('relay', (resource, payload) => {
    relay.dispatch(resource, payload);
  });

}

// Export Socket

module.exports = Socket;