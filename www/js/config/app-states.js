'use strict';
require('angular-ui-router');
var _ = require('lodash');

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
      .state('auth', {
        // 2-Register-sign-in
        cache: false,
        url: '/auth',
        templateUrl: '/templates/auth/index.html',
        controller: 'LandingController as ctrl',
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
        params: {
          identifier: null
        },
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
        controller: 'UserCreateController as userCreateCtrl',
        data: {
          auth: false
        }
      })
      .state('blocker', {
        url: '/blocker',
        templateUrl: '/templates/common/blocker.html',
        controller: 'BlockerController as ctrl',
        params: {
          url: null,
          title: null
        },
        data: {
          auth: true
        }
      })
      .state('users-new-facebook', {
        url: '/users/new/facebook?step',
        templateUrl: '/templates/users/new-facebook.html',
        controller: 'UserFacebookCreateController as userFacebookCreateCtrl',
        data: {
          auth: true
        }
      })
      .state('users-add-to-waitlist', {
        url: '/users/new/add-to-waitlist',
        templateUrl: '/templates/users/waitlist-new.html',
        controller: 'UserAddWaitlistController as userCreateCtrl',
        data: {
          auth: false
        }
      })
      .state('user-waitlist', {
        url: '/users/new/user-waitlist',
        templateUrl: '/templates/users/user-waitlist.html',
        controller: 'UserAddWaitlistController as userCreateCtrl',
        data: {
          auth: false
        }
      })
      .state('sunny-santa-monica', {
        url: '/users/new/sunny-santa-monica',
        templateUrl: '/templates/users/sunny-santa-monica.html',
        controller: 'UserAddWaitlistController as userCreateCtrl',
        data: {
          auth: false
        }
      })
      .state('quiz-video', {
        url: '/quiz/video',
        templateUrl: '/templates/quiz/video.html',
        controller: 'QuizController as ctrl',
        data: {
          auth: true
        }
      })
      .state('quiz-faq', {
        url: '/quiz/faq',
        templateUrl: '/templates/quiz/faq.html',
        controller: 'QuizController as ctrl',
        data: {
          auth: true
        }
      })
      .state('quiz-list', {
        url: '/quiz/list',
        templateUrl: '/templates/quiz/quiz.html',
        controller: 'QuizController as ctrl',
        data: {
          auth: true
        }
      })
      .state('quiz-index', {
        url: '/quiz/index?step',
        templateUrl: '/templates/quiz/index.html',
        controller: 'QuizController as ctrl',
        data: {
          auth: true
        }
      })
      .state('verify-id', {
        url: '/verify-id?step',
        templateUrl: '/templates/verify-id/new.html',
        controller: 'VerifyIdController as ctrl',
        data: {
          auth: true
        }
      })
      .state('users-edit-general', {
        url: '/users-edit-general',
        templateUrl: '/templates/users/edit-general.html',
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
        url: '/licenses/:licenseId/edit?fromBooking',
        templateUrl: '/templates/licenses/edit.html',
        controller: 'LicenseEditController as licenseCtrl',
        data: {
          auth: true
        },
        resolve: {
          licenses: ['$stateParams', '$data', function ($stateParams, $data) {
            return $data.resources.licenses.get({id: $stateParams.licenseId}).$promise;
          }]
        }
      })
      .state('licenses-form', {
        url: '/licenses/form?fromBooking',
        templateUrl: '/templates/licenses/edit.html',
        controller: 'LicenseEditController as licenseCtrl',
        data: {
          auth: true
        },
        resolve: {
          licenses: ['$data', '$auth', function ($data, $auth) {
            return $data.initialize('licenses')
              .then(function (licenses) {
                return _.filter(licenses, {userId: $auth.me.id});
              });
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
        controller: 'CreditCardController as creditCardCtrl',
        data: {
          auth: true
        },
        resolve: {
          cards: ['$data', '$auth', function ($data, $auth) {
            return new $data.resources.Card({
              userId: $auth.me.id,
              service: 'stripe',
              card: {}
            });
          }]
        }
      })
      .state('credit-cards-edit', {
        // 12-Payment-method@2x.png
        url: '/credit-cards/:cardId/edit',
        templateUrl: '/templates/credit-cards/edit.html',
        controller: 'CreditCardController as ctrl',
        data: {
          auth: true
        },
        resolve: {
          cards: ['$data', '$stateParams', function ($data, $stateParams) {
            return $data.resources.Card.get({
              id: $stateParams.id
            }).$promise;
          }]
        }
      })
      .state('credit-cards-form', {
        // 12-Payment-method@2x.png
        url: '/credit-cards/form',
        templateUrl: '/templates/credit-cards/edit.html',
        controller: 'CreditCardController as ctrl',
        data: {
          auth: true
        },
        resolve: {
          cards: ['$data', function ($data) {
            return $data.initialize('Card');
          }]
        }
      })
      .state('auth-account-verify', {
        // 10.1-Verification
        url: '/auth/account-verify?step&token&fromBooking',
        templateUrl: '/templates/auth/account-verify.html',
        controller: 'VerifyController as verifyCtrl',
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
        controller: 'CarsMapController as cars',
        data: {
          auth: true,
          hasGMap: true
        },
        resolve: {
          cars: ['$data', function ($data) {
            return $data.initialize('cars');
          }],
          locations: ['$data', function ($data) {
            return $data.initialize('locations');
          }]
        }
      })
      .state('cars-list', {
        // 14-Find-waivecar
        url: '/cars-list?ids',
        templateUrl: '/templates/cars/list.html',
        controller: 'CarsListController as cars',
        data: {
          auth: true
        },
        resolve: {
          cars: ['$stateParams', '$data', function ($stateParams, $data) {
            return $data.initialize('cars')
              .then(function (cars) {
                if ($stateParams.ids != null) {
                  return cars.filter(function (car) {
                    return _.includes($stateParams.ids, car.id);
                  });
                }
                return cars;
              });
          }]
        }
      })
      .state('cars-show', {
        // 15-Book-waivecar
        url: '/cars/:id?displayRequirements',
        templateUrl: '/templates/cars/show.html',
        controller: 'CarController as ctrl',
        data: {
          auth: true,
          hasGMap: true
        },
        resolve: {
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
        controller: 'BookingsController as ctrl',
        data: {
          auth: true,
          hasGMap: true
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
      controller: 'ActiveBookingController as ctrl',
      data: {
        auth: true,
        hasGMap: true
      }
    })

    .state('start-ride', {
      url: '/bookings/:id/start',
      templateUrl: '/templates/bookings/start-ride.html',
      controller: 'StartRideController as ctrl',
      data: {
        auth: true
      }
    })

    .state('dashboard', {
      url: '/bookings/:id/dashboard',
      templateUrl: '/templates/bookings/dashboard.html',
      controller: 'DashboardController as ctrl',
      data: {
        auth: true,
        hasGMap: true
      }
    })

    .state('bookings-show', {
      url: '/bookings/:id',
      templateUrl: '/templates/bookings/show.html',
      controller: 'BookingSummaryController as ctrl',
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
      controller: 'ParkingLocationController as ctrl',
      data: {
        auth: true
      }
    })
    .state('end-ride', {
      url: '/bookings/:id/end-ride',
      templateUrl: '/templates/bookings/complete-ride.html',
      controller: 'CompleteRideController as ctrl',
      data: {
        auth: true
      }
    })

    .state('report-problem', {
      url: '/bookings/:id/new-problem',
      templateUrl: '/templates/report-problem/new.html',
      controller: 'ReportProblemController as ctrl',
      data: {
        auth: true
      }
    })
    .state('show-problem', {
      url: '/bookings/:id/show-problem',
      templateUrl: '/templates/report-problem/show.html',
      controller: 'ShowProblemController as ctrl',
      data: {
        auth: true
      }
    })
    .state('damage-gallery', {
      url: '/bookings/:id/damage-gallery/:return',
      templateUrl: '/templates/report-problem/gallery.html',
      controller: 'DamageGalleryController as ctrl',
      data: {
        auth: true
      }
    });

    $stateProvider
      .state('messages-new', {
        // 34-Contact
        url: '/messages/new',
        templateUrl: '/templates/messages/new.html',
        controller: 'MessageController as ctrl'
      })
      .state('messages-sent', {
        // 35-Message-confirmation
        url: '/messages/sent',
        templateUrl: '/templates/messages/sent.html',
        controller: 'MessageController as ctrl'
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
      .state('info', {
        url: '/info',
        templateUrl: '/templates/info/index.html'
      })
      .state('info-return-zone', {
        url: '/info-return-zone',
        templateUrl: '/templates/info/return-zone.html'
      })
      .state('info-driving-zone', {
        url: '/info-driving-zone',
        templateUrl: '/templates/info/driving-zone.html'
      })
      .state('info-faq', {
        url: '/info-faq',
        templateUrl: '/templates/info/faq.html'
      })
      .state('info-insurance', {
        url: '/info-insurance',
        templateUrl: '/templates/info/insurance.html'
      })
      .state('ads', {
        url: '/ads',
        templateUrl: '/templates/ads/index.html',
        params: {
          redirectUrl: null,
          redirectParams: null
        }
      });
    $urlRouterProvider.otherwise('/auth');

  }

];
