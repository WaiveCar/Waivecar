'use strict';

let verification = require('./lib/verification');

Route.pst('/verifications/:type/:id', [
  'isAuthenticated',
  function *(type, id) {
    return yield verification.sendUser(type, id, this.payload, this.auth.user);
  }
]);

// ### Verification Request
// Attempts to send a verification token containing the body payload.

Route.pst('/verifications/:type', [
  'isAuthenticated',
  function *(type) {
    return yield verification.send(type, this.payload, this.auth.user);
  }
]);

// ### Verification Payload
// Attempts to return a verification payload belonging to provided token.

Route.get('/verifications/:token', [
  'isAuthenticated',
  function *(token) {
    return yield verification.get(token, this.auth.user);
  }
]);

// ### Verification Attempt
// Attempts to verify a token provided in the body payload.

Route.put('/verifications/:token', {
  policy  : 'isAuthenticated',
  handler : function *(token) {
    return yield verification.handle(token, this.auth.user);
  }
});
