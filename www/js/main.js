'use strict';

angular.module('app.controllers', []);
angular.module('app.directives', []);
angular.module('app.filters', []);
angular.module('app.providers', []);
angular.module('app.services', []);

angular.module('app', [
  'ionic',
  'app.controllers',
  'app.services'
])

.run([
  '$ionicPlatform',
  function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
  }
])

.config([
  '$stateProvider',
  '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    $stateProvider

    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html"
    })

    .state('app.users-new', {
      url: "/register",
      views: {
        'menuContent': {
          templateUrl: "templates/users/new.html"
        }
      }
    })

    .state('app.users-show', {
      url: "/my-account",
      views: {
        'menuContent': {
          templateUrl: "templates/users/show.html"
        }
      }
    })

    .state('app.search', {
      url: "/search",
      views: {
        'menuContent': {
          templateUrl: "templates/search.html"
        }
      }
    })

    .state('app.browse', {
      url: "/browse",
      views: {
        'menuContent': {
          templateUrl: "templates/browse.html"
        }
      }
    })
      .state('app.playlists', {
        url: "/playlists",
        views: {
          'menuContent': {
            templateUrl: "templates/playlists.html"
          }
        }
      })

    .state('app.single', {
      url: "/playlists/:playlistId",
      views: {
        'menuContent': {
          templateUrl: "templates/playlist.html"
        }
      }
    });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/playlists');
  }
]);
