function UserController($rootScope, $scope, $state, AuthService, DataService,WaiveCarStateService,FaceBookService) {
  var self                  = this;
  self.$state               = $state;
  self.WaiveCarStateService = WaiveCarStateService;
  self.AuthService          = AuthService;
  self.DataService          = DataService;
  self.FaceBookService      = FaceBookService;
  self.active               = DataService.active;
  self.UsersResource        = DataService.resources.users;

  self.forms       = {
    // prefill for easier testing ;)
    userForm     : {
      firstName : 'Travis',
      lastName  : 'Kalanick',
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
UserController.prototype.connectWithFacebook = function($auth) {
  var self=this;
  function registerUserByFacebook(code){
      var data={
        type:'register',
        code:code,
        redirectUri:'http://localhost/'
      };
      self.UsersResource.facebook(data,function(result){
        self.DataService.merge('users', result);
        self.DataService.activateKnownModel('users', result.id, function(err,data){
           self.WaiveCarStateService.next();
        });
      },
      function(error){
        prompt("",JSON.stringify(error));
        alert(arguments);
        alert(error);
      });

  };
  self.FaceBookService.getFacebookInfo().then(function(code){
    registerUserByFacebook(code);
  },
  function(error){
    alert(error);
  })
};
UserController.prototype.create = function() {
  var self           = this;
  var redirectUrl    = self.$state.params.redirectUrl;
  var redirectParams = self.$state.params.redirectParams;

  self.DataService.create('users', self.forms.userForm, function(err) {
    self.AuthService.login({
      email    : self.forms.userForm.email,
      password : self.forms.userForm.password
    }, function(auth) {
       self.WaiveCarStateService.next();
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
  'FaceBookService',
  UserController
]);