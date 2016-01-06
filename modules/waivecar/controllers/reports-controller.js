'use strict';

let service = require('../lib/report-service');

Bento.Register.Controller('ReportsController', function(controller) {

  /**
   * Creates a new waivecar report.
   * @return {Object}
   */
  controller.create = function *() {
    return yield service.create(this.payload, this.auth.user);
  };

  /**
   * Returns a indexed list of reports.
   * @return {Array}
   */
  controller.index = function *() {
    return yield service.index(this.query, this.auth.user);
  };

  return controller;

});
