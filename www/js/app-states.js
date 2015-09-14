window.app.config([
  '$stateProvider',
  '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
    'use strict';

    // not required:
    // 9-Connect with facebook@2x.png
    // guide only:
    // 10-Inline-errors@2x.png

    // not states:
    // 13-Nav@2x.png (a template found in /common)
    // 17-Reach-notification@2x.png (not moved yet in to /common - it is a notification)

    // yet to sift through:
    // 19-Connecting-to-waivecar@2x .png
    // 19.1-Reporta-problem@2x.png
    // 19.2-Report-problem-success@2x.png
    // 20-Dashboard@2x.png
    // 21-Selected-charging-station@2x.png
    // 22-Dashboard-paying-user@2x.png
    // 23-Summary@2x.png
    // 24-End-ride-all-good-not-charging@2x.png
    // 25-Error-not-charging@2x.png
    // 26-End-ride-no-battery@2x .png
    // 27-Low-battery@2x.png
    // 28-Low-time@2x.png
    // 33-Summary@2x.png

    // INTRO, SIGN-IN, REGISTRATION
    $stateProvider
      .state('landing', {
        // 1-Intro
        cache: false,
        url: '/',
        templateUrl: '/templates/landing/index.html'
      })
      .state('auth', {
        // 2-Register-sign-in
        cache: false,
        url: '/auth',
        templateUrl: '/templates/auth/index.html',
        data: {
          auth: false
        }
      })
      .state('auth-login', {
        // 3-Sign in / 4-Sign-in-error
        cache: false,
        url: '/auth/login',
        templateUrl: '/templates/auth/login.html',
        data: {
          auth: false
        }
      })
      .state('auth-forgot-password', {
        // 5-Forgot-password / 7-Forgot-password-error
        cache: false,
        url: '/auth/forgot-password',
        templateUrl: '/templates/auth/forgot-password.html',
        data: {
          auth: false
        }
      })
      .state('auth-forgot-password-success', {
        // 6-Forgot-password-success
        cache: false,
        url: '/auth/forgot-password-success',
        templateUrl: '/templates/auth/forgot-password-success.html?34',
        data: {
          auth: false
        }
      })
      .state('auth-reset-password', {
        // Screen not in Invision, but required. (enter reset code to reset password)
        cache: false,
        url: '/auth/reset-password',
        // TODO: Implement this
        templateUrl: '/templates/auth/reset-password.html',
        data: {
          auth: false
        }
      })
      .state('users-new', {
        // 8-Register
        url: '/users/new?{step:int}',
        templateUrl: '/templates/users/new.html',
        data: {
          auth: false
        }
      })
      .state('licenses-photo', {
        // 11-Drivers-id
        url: '/licenses/photo?{step:int}',
        templateUrl: '/templates/licenses/photo.html',
        data: {
          auth: true
        }
      })
      .state('licenses-new', {
        // 11.1-Drivers-id
        url: '/licenses/new',
        templateUrl: '/templates/licenses/new.html',
        data: {
          auth: true
        }
      })
      .state('credit-cards-new', {
        // 12-Payment-method@2x.png
        url: '/credit-cards/new',
        templateUrl: '/templates/credit-cards/new.html',
        data: {
          auth: true
        }
      });

    // CORE FLOW
    $stateProvider
      .state('cars', {
        // 14-Find-waivecar
        url: '/cars',
        templateUrl: '/templates/cars/index.html'
      })
      .state('cars-show', {
        // 15-Book-waivecar
        url: '/cars/:id',
        templateUrl: '/templates/cars/show.html'
      })
      .state('bookings-edit', {
        // 16-Get-your-waivecar
        url: '/bookings/:id/edit',
        templateUrl: '/templates/bookings/edit.html',
        data: {
          auth: true
        }
      })
      .state('cars-edit', {
        // 18-WaiveCar-connect
        url: '/cars/:id/edit',
        templateUrl: '/templates/cars/show.html'
      });

    // NOT SURE
    $stateProvider
      .state('bookings', {
        // 32-Past-rides@2x.png
        url: '/bookings',
        templateUrl: '/templates/bookings/index.html',
        data: {
          auth: true
        }
      })

    // .state('bookings-new', {
    //   url: '/bookings/new',
    //   templateUrl: '/templates/bookings/new.html',
    //   data: {
    //     auth: true
    //   }
    // })

    .state('bookings-show', {
      url: '/bookings/:id',
      templateUrl: '/templates/bookings/show.html',
      data: {
        auth: true
      }
    });

    $stateProvider
      .state('messages-new', {
        // 34-Contact
        url: '/messages/new',
        templateUrl: '/templates/messages/new.html'
      })
      .state('messages-sent', {
        // 35-Message-confirmation
        url: '/messages/sent',
        templateUrl: '/templates/messages/sent.html'
      });

    $stateProvider
      .state('credit-cards', {
        // 31-Payment-method@2x.png BUT SHOULD SHOW LAST 4 Digits (and perhaps even a List of all registered cards)
        url: '/credit-cards',
        templateUrl: '/templates/credit-cards/index.html',
        data: {
          auth: true
        }
      })
      .state('users-edit', {
        // 29-Account-editing@2x.png / 29-Account-saved@2x.png / 29-Account@2x.png / 29.1-Account@2x.png / 29.2-Account@2x.png
        url: '/users/:id/edit',
        // TODO: Not implemented
        templateUrl: '/templates/users/edit.html',
        data: {
          auth: true
        }
      })
      .state('licenses-show', {
        url: '/licenses/:id',
        // TODO: Not implemented
        templateUrl: '/templates/licenses/show.html',
        data: {
          auth: true
        }
      })
      .state('licenses-edit', {
        // 11-Drivers-id@2x.png / 11.05-Drivers-id-uploading-photo@2x.png / 11.06-Drivers-id-photo-uploaded@2x.png //     / 30-Drivers-license@2x.png
        url: '/licenses/:id/edit',
        templateUrl: '/templates/licenses/edit.html',
        data: {
          auth: true
        }
      })
      .state('vision', {
        // 36-Our-vision@2x.png
        url: '/vision',
        templateUrl: '/templates/vision/index.html',
        data: {
          auth: true
        }
      })
      .state('ads', {
        url: '/ads',
        templateUrl: '/templates/ads/index.html',
        params: {
          redirectUrl: null,
          redirectParams: null
        }
      })
      .state('errors-show', {
        url: '/errors/:id',
        templateUrl: '/templates/errors/show.html'
      });

    $urlRouterProvider.otherwise('/');

  }

]);
