'use strict';

describe('User Module', function() {
  this.timeout(10000);

  // ### User Service
  // Test against the user service.

  describe('Service', () => {
    require('./service');
  });
});
