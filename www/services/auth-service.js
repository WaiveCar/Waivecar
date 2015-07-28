function AuthService($session, DataService) {

  return {

    token: $session.has('auth') ? $session.get('auth') : false,

    purge: function() {
      $session.purge();
      this.token = false;
      return this;
    },

    login: function(data, next) {
      var self = this;
      DataService.resources.users.login(data, angular.bind(this, function(user) {
        DataService.activate('users', user.id, function(err) {
          $session.set('auth', { token: user.token }).save();
          next(false, user);
        });
      }), function(error) {
        if (error.status === 401) {
          next('Your e-mail or password is incorrect. Please try again.');
        } else {
          next('An error occured!');
        }
      });

      return this;
    },

    logout: function(data, next) {
      $session.purge();

      if (!data) {
        if (next) return next();
        return;
      }

      DataService.resources.users.logout(data, angular.bind(this, function (user) {
        // $session.purge();
      }), function(error) {
        if (error) {
          next('An error occured whilst attempting to logout. Please try again.');
        } else {
          next('An error occured!');
        }
      });

      return this;
    },

    forgot: function(data, next) {
      Users.forgot(data, function (data) {
        next(false, data);
      }, function(error) {
        if (error.data.status === 404) {
          next('The email you provided was not found in our database');
        } else {
          next('An error occured!');
        }
      });

      return this;
    },

    resetPassword: function(data, next) {
      Users.resetPassword(data, function () {
        next(false);
      }, function(error) {
        if (error.data.status === 400) {
          next(error.data.error);
        } else {
          next('An error occured!');
        }
      });

      return this;
    }
  };

}

angular.module('app')
.factory('AuthService', [
  '$session',
  'DataService',
  AuthService
]);
