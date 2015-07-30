function SocketService($config, socketFactory) {
  var remote = io.connect($config.uri.api, { path: '/socket/socket.io' });
  console.log('connecting to ' +  $config.uri.sockets);

  var socket = socketFactory({
    ioSocket: remote
  });

  socket.forward('error');

  socket.on('subscribed', function() {
    console.log('subscribed');
  });

  socket.on('unsubscribed', function() {
    console.log('unsubscribed');
  });

  socket.on('event', function() {
    console.log('event');
  });

  socket.on('connect', function() {
    console.log('connected');
  });

  socket.on('disconnect', function() {
    console.log('disconnected');
  });

  return socket;

}

angular.module('app')
.factory('$socket', [
  '$config',
  'socketFactory',
  SocketService
]);
