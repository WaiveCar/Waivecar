(function () {
  'use strict';
  angular.module('app.controllers', []);
  angular.module('app.directives', []);
  angular.module('app.filters', []);
  angular.module('app.providers', []);
  angular.module('app.services', []);

  window.app = angular.module('app', [
    'ionic',
    'ngCordova',
    'ngResource',
    'ngMessages',
    'ngFitText',
    'ui.router',
    'btford.socket-io',
    'ionic-datepicker',
    'app.controllers',
    'app.directives',
    'app.filters',
    'app.providers',
    'app.services',
    'config',
    'Maps',
    'MockBehaviors',
    'ngMaterial',
    'angularPayments'
    // 'countdown',
    // 'ads',
    // 'ChargingStations',
    // 'PointsOfInterest',
    // 'layout',
    // 'Camera',
    // 'social'
  ]);

  ionic.Platform.ready(function () {
    angular.bootstrap(document, ['app']);
  });

}());
