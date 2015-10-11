'use strict';

import config from 'config';
import auth   from './auth';

class Socket {

  /**
   * Sets up socket connection and events.
   * @return {Void}
   */
  constructor() {
    if (!config.api.socket) {
      return;
    }
    this.connect(config.api.socket);

    // ### Bind Events
    // Bind all the event handlers to the socket.

    this.connected = this.connected.bind(this);

    // ### Assign Events
    // Assign all the events to their appropriate socket methods.
    
    this.socket.on('connect', this.connected);
  }

  /**
   * Connect to a socket.
   * @param  {Mixed} settings
   * @return {Void}
   */
  connect(settings) {
    if (typeof settings === 'object') {
      if (settings.uri && settings.options) {
        this.socket = io(settings.uri, settings.options);
      } else if (settings.uri) {
        this.socket = io(settings.uri);
      }
    } else {
      this.socket = io(settings);
    }
  }

  // ### Socket Methods

  /**
   * Event listener.
   * @param  {...Mixed} args
   * @return {Void}
   */
  on(...args) {
    this.socket.on(...args);
  }

  /**
   * Emit an event on the socket.
   * @param  {...Mixed} args
   * @return {Void}
   */
  emit(...args) {
    this.socket.emit(...args);
  }

  /**
   * Authenticate with the socket.
   * @param  {String} token
   * @return {Void}
   */
  authenticate(token) {
    this.emit('authenticate', token, (error) => {
      if (error) {
        return console.warn('Socket > An error occured when attempting to authenticate the socket.');
      }
      console.log('Socket > Successfully authenticated with the socket.');
    });
  }

  // ### Socket Event Handlers

  /**
   * Triggers when socket connects to the server.
   * @return {Void}
   */
  connected() {
    if (auth.check()) {
      this.authenticate(auth.user.token);
    } else {
      console.log('Socket > Connected as guest.');
    }
  }

}

module.exports = new Socket();