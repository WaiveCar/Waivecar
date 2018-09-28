let config = require('config');
let auth   = require('./auth');
let relay  = require('./relay');
let socket = getSocket();

class Socket {

  static on(...args) {
    if (!socket) {
      return console.warn(`Socket > Service has not been configured with this application.`);
    }
    socket.on(...args);
  }

  static emit(...args) {
    if (!socket) {
      return console.warn(`Socket > Service has not been configured with this application.`);
    }
    socket.emit(...args);
  }

  static authenticate(token) {
    this.emit('authenticate', token, (error) => {
      if (error) {
        return console.warn(`Socket > An error occured when attempting to authenticate the socket.`);
      }
      console.log(`Socket > Successfully authenticated with the socket.`);
    });
  }

}

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
    let token = auth.token();
    if (token) {
      Socket.authenticate(token);
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
