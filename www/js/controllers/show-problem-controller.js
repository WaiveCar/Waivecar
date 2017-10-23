'use strict';
var angular = require('angular');


function ShowProblemController ($injector) {

  var $data = $injector.get('$data');

  this.model = {
    file: prepareResult($data.active.damagePhoto),
    comment: $data.active.damagePhoto.description
  };

  function prepareResult (file) {
    file.style = {
      'background-image': 'url(' + file.url + ')'
    };
    return file;
  }
}

module.exports = angular.module('app.controllers').controller('ShowProblemController', [
  '$injector',
  '$stateParams',
  ShowProblemController
]);
