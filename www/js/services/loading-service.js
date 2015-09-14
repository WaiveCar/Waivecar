angular.module('app.services').factory('$loading', [
  '$ionicLoading',
  function ($ionicLoading) {
    'use strict';

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
