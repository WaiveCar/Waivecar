'use strict';

let service = require('../lib/geocoding-service');

Bento.Register.Controller('GeocodingController', function(controller) {

  /**
   * Fetch reverse geocoding
   * @return {Object}
   */
  controller.show = function *() {
    return yield service.show(this.query);
  };

  return controller;

});
