'use strict';
var angular = require('angular');

module.exports = angular.module('app.directives')
  .directive('advertisement', [

    function advertisementDirective() {

      return {
        templateUrl: 'templates/directives/advertisement.html',
        controllerAs: 'ads',
        controller: [
          '$rootScope',
          '$scope',
          '$state',
          '$timeout',
          function AdsController($rootScope, $scope, $state, $timeout) {

            // var init = function () {
            //   if ($state.params.redirectUrl == null) {
            //     $state.go('fleet');
            //   }
            // };

            var timeOutFn = function () {
              $state.go($state.params.redirectUrl, $state.params.redirectParams);
            };

            $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
              if (toState.name === 'ads') {
                $timeout(timeOutFn, 2000);
              }
            });

            $timeout(timeOutFn, 2000);

            // init();

          }
        ]
      };

    }

  ]);
