var _ = require('lodash');

exports = module.exports = function(logger, pubsub) {

  return function(socket) {

    if (!_.isObject(socket.intervals)) socket.intervals = {};

    if (!_.isObject(socket.timeouts)) socket.timeouts = {};

    socket.on('subscribe', function(options, next) {
      pubsub.subscribe(socket, options, next);
    });

    socket.on('unsubscribe', function(options, next) {
      pubsub.unsubscribe(socket, options, next);
    });

    socket.on('disconnect', function disconnect() {
      // clear all timeouts and intervals for the given socket
      if (_.isObject(socket.timeouts)) {
        for (var timeout in socket.timeouts) {
          clearTimeout(socket.timeouts[timeout]);
        }

        socket.timeouts = {};
      }
      if (_.isObject(socket.intervals)) {
        for (var interval in socket.intervals) {
          clearInterval(socket.intervals[interval]);
        }

        socket.intervals = {};
      }

      logger.info('%s disconnected', 'client'); //socket.decoded_token.email);
    });

    logger.info('%s connected', 'client'); //, socket.decoded_token.email);
  };
};

exports['@singleton'] = true;
exports['@require'] = [ 'igloo/logger', 'services/pubsub-service' ];