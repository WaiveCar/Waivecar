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
  // var savedCode="AQCu-OwWQKcqVM1fJuYslhgnCAFX-mgIfZL0xh9gYEskWKuyzclXzhIxUc-e9s4066tSc4m72L33ch-glzRNFy1-BI12g182HOXptibUAYpK5DsdWyI9t5mK-G-l7UdEYpTz6nKjzcacNmXZsvS-HbUSjxIICBRW5y3HmZGtlXpzp4TPWMxtHsdUmi4rpNqxqt7MSjNL8s01jwj_z8h9-bzTm3JWLD0k3ilx_pVRdWkXFSYO0xP55GolJoJqJAQYgBbO43bF21X3MPO24dQC5dl9yiPq8Kx6J15bYzk2uKpxH1luaeqYKiqs4Twi_ii2i_4jBGBRIAGHFiJsL1r-z8gm-kms7_QwAm6xxdeJohmlvg#_=_";
  function registerUserByFacebook(code){
      var data={
        type:'register',
        code:code,
        redirectUri:'http://localhost/'
      };
      prompt("SENDING",JSON.stringify(data));
      self.UsersResource.facebook(data,function(result){
        prompt("",JSON.stringify(result));
        prompt("",arguments);
      },
      function(error){
        prompt("",JSON.stringify(error));
        alert(arguments);
        alert(error);
      });

  };
  // registerUserByFacebook(savedCode);
  // return;
  
  
  self.FaceBookService.getFacebookInfo().then(function(code){
    prompt("RECEBI",code);
    alert("HERE");
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