angular.module('app.services').factory('$auth', [
  '$session',
  '$data',
  function ($session, $data) {
    'use strict';

    return {

      isAuthenticated: function () {
        this.token = $session.has('auth') ? $session.get('auth') : false;
        return this.token !== false;
      },

      token: $session.has('auth') ? $session.get('auth') : false,

      purge: function () {
        $session.purge();
        this.token = false;
        return this;
      },

      facebookLogin: function (code, next) {
        var _this = this;
        var data = {
          type: 'login',
          code: code,
          redirectUri: 'http://localhost/'
        };

        $data.resources.users.facebook(data, function (user) {
            $data.resources.users.me(function (me) {
              $session.set('auth', {
                token: user.token
              }).save();

              $data.me = me;

              _this.token = $session.get('auth');

            });
          },
          next);

      },

      login: function (data, next) {
        var _this = this;
        var _user;

        $data.resources.users.login(data).$promise
          .then(function (user) {
            _user = user;

            $session.set('auth', {
              token: user.token
            }).save();

            _this.token = $session.get('auth');

            return $data.resources.users.me().$promise;

          })
          .then(function (me) {
            $data.me = me;
            return next(null, _user);

          })
          .catch(function (response) {
            if (response.status === 0) {
              return next('Unable to reach the server. CORS issue!');
            }
            if (response.data.code === 'AUTH_INVALID_CREDENTIALS') {
              return next('Your e-mail or password is incorrect. Please try again.');
            }
            return next('An error occured! ' + response.data.message);

          });

        return this;

      },

      logout: function (data, next) {
        $session.purge();

        if (!data) {
          return (next || angular.identity)();
        }

        $data.resources.users.logout($data.me, angular.bind(this, function (user) {
          // $session.purge();
        }), function (error) {
          if (error) {
            return next('An error occured whilst attempting to logout. Please try again.');
          }

          return next('An error occured!');

        });

        return this;
      }

      // forgot: function(data, next) {
      //   Users.forgot(data, function (data) {
      //     next(false, data);
      //   }, function(error) {
      //     if (error.data.status === 404) {
      //       next('The email you provided was not found in our database');
      //     } else {
      //       next('An error occured!');
      //     }
      //   });

      //   return this;
      // },

      // resetPassword: function(data, next) {
      //   Users.resetPassword(data, function () {
      //     next(false);
      //   }, function(error) {
      //     if (error.data.status === 400) {
      //       next(error.data.error);
      //     } else {
      //       next('An error occured!');
      //     }
      //   });

      //   return this;
      // }
    };
  }
]);
