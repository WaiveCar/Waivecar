function UserController($rootScope, $scope, $state, AuthService, DataService,WaiveCarStateService) {
  var self         = this;
  self.$state      = $state;
  self.WaiveCarStateService = WaiveCarStateService;
  self.AuthService = AuthService;
  self.DataService = DataService;
  self.active      = DataService.active;
  self.forms       = {
    // prefill for easier testing ;)
    userForm     : {
      fullName : 'Travis Kalanick',
      email     : 'matt.ginty+' + Math.random() + '@clevertech.biz',
      password  : 'lollipop0',
      mobile    :  '+555 555 555'
    },
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
        self.$state.go('licenses-new', {
          redirectUrl    : redirectUrl,
          redirectParams : redirectParams
        });
      } else {
        self.WaiveCarStateService.next();
        //self.$state.go('credit-cards');
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
  'WaiveCarStateService',
  UserController
]);