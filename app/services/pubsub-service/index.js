var async = require('async');
var _ = require('lodash');
var path = require('path');

exports = module.exports = function(Setting, config, logger) {

  var methods = {
    sockets: [],

    publishAdd: function(modelName, model) {
      return methods.publish(modelName, 'add', model);
    },

    publishUpdate: function(modelName, model) {
      return methods.publish(modelName, 'update', model);
    },

    publishRemove: function(modelName, model) {
      return methods.publish(modelName, 'remove', model);
    },

    publish: function(modelName, verb, model) {
      var message = {
        modelName: modelName,
        id: model.id,
        verb: verb,
        eventName: [ modelName, verb ].join(':'),
        model: model
      };

      _.each(methods.sockets, function(socket) {
        if (socket) socket.emit('publish', message);
      });
    },

    subscribe: function(socket, options, next) {
      methods.sockets.push(socket);
      socket.emit('subscribed', options);
      return next();
    },

    unsubscribe: function(socket, options, next) {
      var index = _.indexOf(methods.sockets, _.findWhere(methods.sockets, { id: socket.id }));
      if (index >= 0) methods.sockets.splice(index, 1);
      socket.emit('unsubscribed', options);
      return next();
    }
  };

  return methods;
};

module.exports['@singleton'] = true;
module.exports['@require'] = [ 'models/setting', 'igloo/settings', 'igloo/logger' ];
