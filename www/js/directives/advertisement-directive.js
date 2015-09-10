angular.module('app.directives')
  .directive('advertisement', [

    function advertisementDirective() {
      'use strict';

      return {
        templateUrl: 'templates/directives/advertisement.html',
        controllerAs: 'ads',
        controller: [
          '$rootScope',
          '$scope',
          '$state',
          '$timeout',
          function AdsController($rootScope, $scope, $state, $timeout) {

            var init = function () {
              if ($state.params.redirectUrl == null) {
                $state.go('fleet');
              }
            };

            var timeOutFn = function () {
              $state.go($state.params.redirectUrl, $state.params.redirectParams);
            };

            $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
              if (toState.name === 'ads') {
                $timeout(timeOutFn, 2000);
              }
            });

            $timeout(timeOutFn, 2000);

            init();

          }
        ]
      };

    }

  ]);

// function AdsController($rootScope, $scope, $state, $timeout) {
//   this.$state = $state;
//   this.handleStateValidity();
//   var self = this;
//   var timeOutFn = function () {
//     self.goToRedirectUrl();
//   }
//   $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
//     if (toState.name == 'ads') {
//       $timeout(timeOutFn, 2000);
//     }
//   });
//   $timeout(timeOutFn, 2000);
// }
// //Redirect if the redirect url is not valid

// AdsController.prototype.handleStateValidity = function () {
//   var redirectUrl = this.$state.params.redirectUrl;
//   if (redirectUrl == null) {
//     this.goBackToState();
//   }
// };
// AdsController.prototype.goBackToState = function () {
//   this.$state.go('fleet');
// };
// AdsController.prototype.goToRedirectUrl = function () {
//   var redirectUrl = this.$state.params.redirectUrl;
//   var redirectParams = this.$state.params.redirectParams;
//   this.$state.go(redirectUrl, redirectParams);
// };
