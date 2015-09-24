'use strict';
var angular = require('angular');
require('ionic');

module.exports = angular.module('app.services').factory('$loader', [
  '$ionicLoading',
  function ($ionicLoading) {

    var defaultOptions = {
      templateUrl: '/templates/common/loading.html',
    };

    function show(options) {
      options = angular.extend(options || {}, defaultOptions);
      $ionicLoading.show(options);
    }

    function hide() {
      $ionicLoading.hide();
    }

    return {
      show: show,
      hide: hide
    };

  }
]);
