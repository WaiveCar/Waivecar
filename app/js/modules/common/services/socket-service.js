angular.module('app.modules.common.services').factory('$socket', [
  '$rootScope',
  '$log',
  '$http',
  '$notification',
  '$applicationLoggingService',
  'socketFactory',
  function($rootScope, $log, $http, $notification, $applicationLoggingService, socketFactory) {
    var ioSocket = io.connect('http://localhost:3000');

    var socket = socketFactory({ ioSocket: ioSocket });
    socket.forward('error');

    socket.on('subscribed', function() {
      console.log('subscribed');
    });

    socket.on('unsubscribed', function() {
      console.log('unsubscribed');
    });

    socket.on('connect', function() {
      console.log('connected');
    });

    socket.on('disconnect', function() {
      console.log('disconnected');
    });

    return socket;

  }
]);
