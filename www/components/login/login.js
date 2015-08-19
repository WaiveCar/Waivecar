function LoginController(FaceBookService) {
  this.FaceBookService = FaceBookService;
}
LoginController.prototype.connectWithFacebook = function($auth) {
  this.FaceBookService.getFacebookInfo();
};
angular.module('app')
.controller('LoginController', [
  'FaceBookService',
  LoginController
]);