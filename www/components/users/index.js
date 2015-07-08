function UserController($rootScope, $scope, $injector) {
  var self = this;
  // var Auth = $injector.get('Auth');
  var Users = $injector.get('Users');

  self.process = {
    userForm: false,
    licenceForm: false,
    paymentForm: false,
    passwordForm: false
  };
  // TODO: we want to just use the $auth'd user in the future and save ourselves the additional fetch.
  // self.user = Auth.me;
  self.user = Users.me();
}

angular.module('app')
.controller('UserController', [
  '$rootScope',
  '$scope',
  '$injector',
  UserController
]);