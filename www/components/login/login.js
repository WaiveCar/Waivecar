function LoginController(FaceBookService,DataService,WaiveCarStateService,AuthService) {
	this.FaceBookService = FaceBookService;
	this.DataService = DataService;
	this.UsersResource  = DataService.resources.users;
	this.AuthService	= AuthService;
	this.WaiveCarStateService = WaiveCarStateService;
	this.form={
		email:null,
		password:null
	}
}
LoginController.prototype.connectWithFacebook = function($auth) {
	var self=this;
	function loginUserByFacebook(code){
		self.AuthService.facebookLogin(code,function(err,data){
			if(err){
				console.log(err);
				return;
			}
			self.WaiveCarStateService.next();
			
		});
	}
	self.FaceBookService.getFacebookInfo().then(function(code){
		loginUserByFacebook(code);
	},
	function(error){
		alert(error);
	});	
};
LoginController.prototype.login = function() {
	var self=this;
	this.AuthService.login(this.form,function(err,user){
		if(err){
			console.log(err);
			return;
		}
		console.log('HERRASA');
		self.WaiveCarStateService.next();
	})
};

angular.module('app')
.controller('LoginController', [
  'FaceBookService',
  'DataService',
  'WaiveCarStateService',
  'AuthService',
  LoginController
]);