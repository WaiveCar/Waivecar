'use strict';
var angular = require('angular');
require('./data-service');

angular.module('app.services')
  .service('ContactService', ContactService);

ContactService.$inject = ['$data'];
function ContactService($data) {

  this.send = function(subject, message) {
    return $data.resources.messages.create({
      subject: subject,
      message: message
    });
  };
}
