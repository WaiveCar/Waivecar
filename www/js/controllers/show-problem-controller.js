'use strict';
var angular = require('angular');
var moment = require('moment');

function ShowProblemController ($injector, $sce) {
  var $data = $injector.get('$data');
  var $window = $injector.get('$window');

  var description = $data.active.damagePhoto.description;
  if(description) {
    description = $sce.trustAsHtml(description.replace(/\n/g, '<br>'));
  } else {
    description = '(No description provided)';
  }
  this.model = {
    file: $data.active.damagePhoto.url,
    comment: description,
    time: moment($data.active.damagePhoto.createdAt).format('MMM D h:mm:ssA')
  };

  this.back = function() {
    $window.history.back();
  };
}

module.exports = angular.module('app.controllers').controller('ShowProblemController', [
  '$injector',
  '$sce',
  ShowProblemController
]);
