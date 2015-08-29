angular.module('app.services').factory('$auth', [
  '$session',
  '$data',
  function ($session, $data) {

    return {

      isAuthenticated : function() {
        this.token = $session.has('auth') ? $session.get('auth') : false;
        return this.token !== false;
      },

      token: $session.has('auth') ? $session.get('auth') : false,

      purge: function() {
        $session.purge();
        this.token = false;
        return this;
      },

      facebookLogin: function(code,next){
          var data={
            type:'login',
            code:code,
            redirectUri:'http://localhost/'
          };
          $data.resources.users.facebook(data,function(user){
             $data.activate('users', user.id, function(err) {
              $session.set('auth', { token: user.token }).save();
            });
          },
          function(error){
            next(error)
          });
      },

      login: function(data, next) {
        var self = this;
        $data.resources.users.login(data, angular.bind(this, function(user) {
          $data.activate('users', user.id, function(err) {
            $session.set('auth', { token: user.token }).save();
            self.token = $session.get('auth');
            return next(err, user);
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

        $data.resources.users.logout(data, angular.bind(this, function (user) {
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
]);
