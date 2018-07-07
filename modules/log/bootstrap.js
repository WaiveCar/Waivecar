'use strict';

let service = require('./lib/log-service');
let event   = Bento.Event;

// ### Log Error
// Logs an error that occured within the api.

event.on('log:error', function *(payload) {
  yield service.error(payload);
});

// ### Log Event
// Catches and stores certain events occuring in the system.

event.on('log:event', function *(payload) {
  yield service.event(payload);
});
