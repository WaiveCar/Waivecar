'use strict';
require('angular-ui-router');

module.exports = [
  '$stateProvider',
  '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {

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
        controller: 'LandingController as landing',
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
        controller: 'AuthController as auth',
        data: {
          auth: false
        }
      })
      .state('auth-forgot-password', {
        // 5-Forgot-password / 7-Forgot-password-error
        cache: false,
        url: '/auth/forgot-password',
        templateUrl: '/templates/auth/forgot-password.html',
        controller: 'AuthController as auth',
        data: {
          auth: false
        }
      })
      .state('auth-forgot-password-success', {
        // 6-Forgot-password-success
        cache: false,
        url: '/auth/forgot-password-success',
        templateUrl: '/templates/auth/forgot-password-success.html',
        controller: 'AuthController as auth',
        data: {
          auth: false
        }
      })
      .state('auth-reset-password', {
        // Screen not in Invision, but required. (enter reset code to reset password)
        cache: false,
        url: '/auth/reset-password?token',
        // TODO: Implement this
        templateUrl: '/templates/auth/reset-password.html',
        controller: 'AuthController as auth',
        data: {
          auth: false
        }
      })
      .state('auth-reset-password-success', {
        // Screen not in Invision, but required.
        cache: false,
        url: '/auth/reset-password-success',
        templateUrl: '/templates/auth/reset-password-success.html',
        data: {
          auth: false
        }
      })
      .state('users-new', {
        // 8-Register
        url: '/users/new?step',
        templateUrl: '/templates/users/new.html',
        controller: 'UserCreateController as userCreate',
        data: {
          auth: false
        }
      })
      .state('users-new-facebook', {
        // 8-Register
        url: '/users/new/facebook?step',
        templateUrl: '/templates/users/new-facebook.html',
        controller: 'UserFacebookCreateController as userCreate',
        data: {
          auth: true
        }
      })
      .state('licenses-new', {
        url: '/licenses/new?step&fromBooking',
        templateUrl: '/templates/licenses/new.html',
        controller: 'LicenseController as licenseCtrl',
        data: {
          auth: true
        }
      })
      .state('licenses-edit', {
        url: '/licenses/:licenseId/edit?step&fromBooking',
        templateUrl: '/templates/licenses/edit.html',
        controller: 'LicenseEditController as licenseCtrl',
        data: {
          auth: true,
          foundLicense: ['$stateParams', '$data', function ($stateParams, $data) {
            return $data.resources.licenses.get({ id: $stateParams.licenseId }).$promise;
          }]
        }
      })
      .state('licenses-request-validation', {
        url: '/licenses/:licenseId/validate',
        templateUrl: '/templates/licenses/validate.html',
        controller: 'LicenseRequestValidationController as ctrl',
        data: {
          auth: true
        }
      })
      .state('credit-cards-new', {
        // 12-Payment-method@2x.png
        url: '/credit-cards/new?step&fromBooking',
        templateUrl: '/templates/credit-cards/new.html',
        controller: 'CreditCardController as ctrl',
        data: {
          auth: true
        }
      })
      .state('credit-cards-edit', {
        // 12-Payment-method@2x.png
        url: '/credit-cards/:id/edit',
        templateUrl: '/templates/credit-cards/edit.html',
        data: {
          auth: true
        }
      })
      .state('auth-account-verify', {
        // 10.1-Verification
        url: '/auth/account-verify?step&token&fromBooking',
        templateUrl: '/templates/auth/account-verify.html',
        controller: 'VerifyController as verify',
        data: {
          auth: true
        }
      });

    // CORE FLOW
    $stateProvider
      .state('cars', {
        // 14-Find-waivecar
        url: '/cars',
        templateUrl: '/templates/cars/index.html',
        controller: 'CarsController as cars',
        data: {
          auth: true
        },
        resolve: {
          cars: ['$data', function ($data) {
            return $data.initialize('cars');
          }]
        }
      })
      .state('cars-show', {
        // 15-Book-waivecar
        url: '/cars/:id?displayRequirements',
        templateUrl: '/templates/cars/show.html',
        controller: 'CarController as ctrl',
        data: {
          auth: true
        },
        resolve: {
          // status: ['BookingService', '$stateParams', function(BookingService, $stateParams){
          //   return BookingService.getCurrentStatus($stateParams.id);
          // }],
          car: ['$data', '$stateParams', function ($data, $stateParams) {
            return $data.resources.cars.get({id: $stateParams.id}).$promise;
          }]
        }
      })
      // .state('bookings-edit', {
      //   // 16-Get-your-waivecar
      //   url: '/bookings/:id/edit',
      //   templateUrl: '/templates/bookings/edit.html',
      //   data: {
      //     auth: true
      //   }
      // })
      .state('cars-edit', {
        // 18-WaiveCar-connect
        url: '/cars/:id/edit',
        templateUrl: '/templates/cars/show.html',
        data: {
          auth: true
        }
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

    .state('bookings-active', {
      url: '/bookings/:id/active',
      templateUrl: '/templates/bookings/active.html',
      controller: 'BookingController as ctrl',
      data: {
        auth: true
      }
    })

    .state('start-ride', {
      url: '/bookings/:id/start',
      templateUrl: '/templates/bookings/start-ride.html',
      controller: 'BookingController as ctrl',
      data: {
        auth: true
      }
    })

    .state('dashboard', {
      url: '/bookings/:id/dashboard',
      templateUrl: '/templates/bookings/dashboard.html',
      controller: 'BookingController as ctrl',
      data: {
        auth: true
      }
    })

    .state('bookings-show', {
      url: '/bookings/:id',
      templateUrl: '/templates/bookings/show.html',
      data: {
        auth: true
      }
    })

    .state('end-ride-options', {
      url: '/bookings/:id/end-ride/options',
      templateUrl: '/templates/bookings/end-ride-options.html',
      controller: 'EndRideController as ctrl',
      data: {
        auth: true
      }
    })
    .state('end-ride-location', {
      url: '/bookings/:id/end-ride/location',
      templateUrl: '/templates/bookings/end-ride-location.html',
      controller: 'EndRideController as ctrl',
      data: {
        auth: true
      }
    })
    .state('end-ride', {
      url: '/bookings/:id/end-ride',
      templateUrl: '/templates/bookings/end-ride.html',
      controller: 'EndRideController as ctrl',
      data: {
        auth: true
      }
    })
    .state('sandpit', {
      url: '/sandpit',
      templateUrl: '/templates/common/sandpit.html',
      controller: 'EndRideController as ctrl',
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

    // ACCOUNT
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
        // 29-Account-editing / 29-Account-saved@2x.png / 29-Account@2x.png / 29.1-Account@2x.png / 29.2-Account@2x.png
        url: '/users/me/edit',
        templateUrl: '/templates/users/edit.html',
        data: {
          auth: true
        }
      })
      .state('vision', {
        // 36-Our-vision@2x.png
        url: '/vision',
        templateUrl: '/templates/vision/index.html'
      })
      .state('ads', {
        url: '/ads',
        templateUrl: '/templates/ads/index.html',
        params: {
          redirectUrl: null,
          redirectParams: null
        }
      });

    $urlRouterProvider.otherwise('/');

  }

];
