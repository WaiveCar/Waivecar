function UserController($rootScope, $scope, $state, AuthService, DataService) {
  var self         = this;
  self.$state      = $state;
  self.AuthService = AuthService;
  self.DataService = DataService;
  self.active      = DataService.active;
  self.forms       = {
    // prefill for easier testing ;)
    userForm     : {
      firstName : 'Travis',
      lastName  : 'Kalanick',
      email     : 'matt.ginty+' + Math.random() + '@clevertech.biz',
      password  : 'lollipop0'
    },
    licenceForm  : {},
    paymentForm  : {},
    passwordForm : {}
  };

  if ($state.params.id) {
    DataService.activate('users', $state.params.id);
  }
}

UserController.prototype.create = function() {
  var self           = this;
  var redirectUrl    = self.$state.params.redirectUrl;
  var redirectParams = self.$state.params.redirectParams;

  self.DataService.create('users', self.forms.userForm, function(err) {
    self.AuthService.login({
      email    : self.forms.userForm.email,
      password : self.forms.userForm.password
    }, function(auth) {
      if (redirectUrl) {
        self.$state.go(redirectUrl, redirectParams);
      } else {
        self.$state.go('users-show', { id: self.active.users.id });
      }
    });
  });
}

angular.module('app')
.controller('UserController', [
  '$rootScope',
  '$scope',
  '$state',
  'AuthService',
  'DataService',
  UserController
]);