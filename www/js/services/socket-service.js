'use strict';
var angular = require('angular');
var io = require('socket.io-client');

module.exports = angular.module('app')
  .factory('$socket', [
    '$settings',
    'socketFactory',
    function ($settings, socketFactory) {

      var remote;

      if ($settings.uri.api.indexOf('localhost') > 0) {
        remote = io.connect('http://localhost:5000');
      // } else if(ionic.Platform.isWebView()){
      //   remote = io.connect('http://192.168.57.1:5000');
      } else {
        remote = io.connect($settings.uri.api, {
          path: '/socket/socket.io'
        });
      }

      var socket = socketFactory({
        ioSocket: remote
      });

      // socket.disconnect();

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
        console.log('socket connected');
      });

      socket.on('disconnect', function () {
        console.log('disconnected');
      });

      return socket;

    }
  ]);
