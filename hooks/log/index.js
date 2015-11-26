'use strict';

let hooks = Bento.Hooks;

/**
 * Triggered when a log:error event is emitted in the api.
 * @param {Object} payload
 */
hooks.set('log:error', function *(payload) {
  // ...
});

/**
 * Triggered when a log:event event is emitted in the api.
 * @param {Object} payload
 */
hooks.set('log:event', function *(payload) {
  // ...
});
