/* global document:false, window: false */
'use strict';

// TODO: Install these modules
//   'ionic-datepicker',

// Vendor modules (... which are dependencies to main 'app' module)
require('jquery');
var angular = require('angular');
var ionic = require('ionic');
require('ionic-angular');
require('ngCordova');
require('angular-messages');
require('angular-socket-io');
require('angular-payments');
require('ng-fittext');
require('./modules/ngIOS9UIWebViewPatch');
require('./modules/ionic.contrib.drawer');

// Components (We first define angular modules which are dependencies to main 'app' module)
angular.module('app.settings', []);
angular.module('app.controllers', []);
angular.module('app.models', []);
angular.module('app.directives', []);
angular.module('app.filters', []);
angular.module('app.providers', []);
angular.module('app.services', []);
angular.module('app.providers', []);
angular.module('app.constants', []);
require('./modules/maps/index');
require('./services/templates.min');

// 'app' definition
var app = angular.module('app', [
  'ngIOS9UIWebViewPatch',
  'ionic',
  'ngCordova',
  'ngResource',
  'ngMessages',
  'ui.router',
  'btford.socket-io',
  'angularPayments',
  'ngFitText',

  'Maps',
  'app.settings',
  'app.controllers',
  'app.constants',
  'app.models',
  'app.directives',
  'app.filters',
  'app.providers',
  'app.services',
  'app.providers',
  'ionic.contrib.drawer',
]);

require('./config/app-settings');

// App config (angular configuring stage)
var states = require('./config/app-states');
var setup = require('./config/app-setup');
app.config(states);
app.config(setup.config);
app.run(setup.run);

// Controllers
require('./controllers/application-controller');
require('./controllers/auth-controller');
require('./controllers/active-booking-controller');
require('./controllers/blocker-controller.js');
require('./controllers/booking-in-progress-controller');
require('./controllers/bookings-controller');
require('./controllers/quiz-controller');
require('./controllers/car-controller');
require('./controllers/cars-list-controller');
require('./controllers/cars-map-controller');
require('./controllers/credit-card-controller');
require('./controllers/credit-cards-controller');
require('./controllers/dashboard-controller');
require('./controllers/info-controller');
require('./controllers/inspection-controller');
require('./controllers/landing-controller');
require('./controllers/license-controller');
require('./controllers/license-edit-controller');
require('./controllers/license-request-validation-controller');
require('./controllers/message-controller');
require('./controllers/user-create-controller');
require('./controllers/user-add-waitlist-controller');
require('./controllers/user-facebook-create-controller');
require('./controllers/user-edit-controller');
require('./controllers/user-edit-general-controller');
require('./controllers/report-problem-controller');
require('./controllers/show-problem-controller');
require('./controllers/damage-gallery-controller');
require('./controllers/start-ride-controller');
require('./controllers/timer-controller');
require('./controllers/menu-controller');
require('./controllers/verify-controller');
require('./controllers/complete-ride-controller');
require('./controllers/parking-location-controller');
require('./controllers/booking-summary-controller');
require('./controllers/verify-id-controller');
require('./constants/us-states');

// Directives
require('./directives/go-back-directive');
require('./directives/lined-directive');
require('./directives/page-title-directive');
require('./directives/reverse-geocoding-directive');
require('./directives/time-left-directive');
require('./directives/wizard-directive');
require('./directives/car-charge-status-directive');
require('./directives/yes-no-toggle');
require('./directives/slider-confirm');

ionic.Platform.ready(function () {

  if(window.cordova){
    document.addEventListener('deviceready', function(){
      angular.bootstrap(document, ['app']);
    }, false);
  } else {
    angular.bootstrap(document, ['app']);
  }

});

module.exports = app;
