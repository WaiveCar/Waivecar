'use strict';
/**
 * ==================  angular-ios9-uiwebview.patch.js v1.1.1 ==================
 *
 * This patch works around iOS9 UIWebView regression that causes infinite digest
 * errors in Angular.
 *
 * The patch can be applied to Angular 1.2.0 – 1.4.5. Newer versions of Angular
 * have the workaround baked in.
 *
 * To apply this patch load/bundle this file with your application and add a
 * dependency on the "ngIOS9UIWebViewPatch" module to your main app module.
 *
 * For example:
 *
 * ```
 * angular.module('myApp', ['ngRoute'])`
 * ```
 *
 * becomes
 *
 * ```
 * angular.module('myApp', ['ngRoute', 'ngIOS9UIWebViewPatch'])
 * ```
 *
 *
 * More info:
 * - https://openradar.appspot.com/22186109
 * - https://github.com/angular/angular.js/issues/12241
 * - https://github.com/driftyco/ionic/issues/4082
 *
 *
 * @license AngularJS
 * (c) 2010-2015 Google, Inc. http://angularjs.org
 * License: MIT
 */
var angular = require('angular');

angular.module('ngIOS9UIWebViewPatch', ['ng']).config(['$provide', function($provide) {


  $provide.decorator('$browser', ['$delegate', '$window', function($delegate, $window) {

    function isIOS9UIWebView(userAgent) {
      return /(iPhone|iPad|iPod).* OS 9_\d/.test(userAgent) && !/Version\/9\./.test(userAgent);
    }

    function applyIOS9Shim(browser) {
      var pendingLocationUrl = null;
      var originalUrlFn = browser.url;

      browser.url = function() {
        if (arguments.length) {
          pendingLocationUrl = arguments[0];
          return originalUrlFn.apply(browser, arguments);
        }

        return pendingLocationUrl || originalUrlFn.apply(browser, arguments);
      };

      function clearPendingLocationUrl() {
        pendingLocationUrl = null;
      }

      /*eslint-disable */
      window.addEventListener('popstate', clearPendingLocationUrl, false);
      window.addEventListener('hashchange', clearPendingLocationUrl, false);
      /*eslint-enable */

      return browser;
    }

    if (isIOS9UIWebView($window.navigator.userAgent)) {
      return applyIOS9Shim($delegate);
    }

    return $delegate;

  }]);
}]);
