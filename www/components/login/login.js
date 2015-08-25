function LoginController(FaceBookService,DataService,WaiveCarStateService) {
	this.FaceBookService = FaceBookService;
	this.DataService = DataService;
	this.UsersResource  = DataService.resources.users;
	this.WaiveCarStateService = WaiveCarStateService;
}
LoginController.prototype.connectWithFacebook = function($auth) {
	var self=this;
	function loginUserByFacebook(code){
		var data={
			type:'login',
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
	}
	
	var self=this;
	self.FaceBookService.getFacebookInfo().then(function(code){
		loginUserByFacebook(code);
	},
	function(error){
		alert(error);
	});
};
angular.module('app')
.controller('LoginController', [
  'FaceBookService',
  'DataService',
  'WaiveCarStateService',
  LoginController
]);