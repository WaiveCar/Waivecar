'use strict';

var angular = require('angular');

module.exports = angular.module('app.directives')
  .directive('sliderConfirm', function() {
    return {
      scope: {
        message: '=',
        onSlide: '&'
      },
      templateUrl: 'templates/directives/slider-confirm.html',
      bindToController: true,
      controllerAs: 'ctrl',
      replace: true,
      controller: ['$scope', '$interval', '$timeout', function($scope, $interval, $timeout) {
        var ctrl = this;

        ctrl.val = 0;
        ctrl.onChange = onChange;
        var registered;
        var timer;
        var triggerAt = null;

        /**
         * Handle change of slider
         * @param {Number} val slider value
         * @returns {Void} none
         */
        function onChange(val) {
          triggerAt = Date.now() + 5e3;
          registerFallback();

          if (+val === 100) {
            if (timer) $interval.cancel(timer);
            ctrl.onSlide();
          }
        }

        /**
         * Start timer to kick off auto falloff
         * @returns {Void} none
         */
        function registerFallback() {
          if (registered) return;
          registered = true;
          timer = $interval(function() {
            if (!triggerAt) return;
            if (Date.now() > triggerAt) {
              registered = false;
              triggerAt = null;
              $interval.cancel(timer);
              fallback();
            }
          }, 50);
        }

        /**
         * Gradually reduces slider value to 0
         * @returns {Void} none
         */
        function fallback() {
          if (ctrl.val <= 0) {
            registered = false;
            return;
          }
          ctrl.val -= 2;

          $timeout(fallback, 50);
        }

      }]
    };
  });
