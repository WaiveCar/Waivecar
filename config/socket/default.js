module.exports = {
  socket : {

    /**
     * Port number to run the socket.io server.
     * @type {Number}
     */
    port : 5000,

    /**
     * The authentication endpoint for fetching authenticated user data.
     * @type {String}
     */
    auth : null,

    /**
     * Redis server information used to receive service communications.
     * @type {Object}
     */
    redis : {
      host : 'localhost',
      port : 6379
    }

  }
};