angular.module('app')
  .factory('$socket', [
    '$config',
    'socketFactory',
    function ($config, socketFactory) {
      'use strict';

      var remote;

      if ($config.uri.api.indexOf('localhost') > 0) {
        remote = io.connect('http://localhost:5000');
      } else {
        remote = io.connect($config.uri.api, {
          path: '/socket/socket.io'
        });
      }

      console.log('connecting to ' + $config.uri.api);

      var socket = socketFactory({
        ioSocket: remote
      });

      socket.disconnect();

      socket.forward('error');

      socket.on('subscribed', function () {
        console.log('subscribed');
      });

      socket.on('unsubscribed', function () {
        console.log('unsubscribed');
      });

      socket.on('event', function () {
        console.log('event');
      });

      socket.on('connect', function () {
        console.log('connected');
      });

      socket.on('disconnect', function () {
        console.log('disconnected');
      });

      return socket;

    }
  ]);
