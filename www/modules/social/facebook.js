function FaceBookService ($q,$cordovaOauth,$config) {
	this.$q=$q;
	this.$cordovaOauth=$cordovaOauth;
  this.$config = $config;
}
FaceBookService.prototype.getFacebookInfo = function() {

  this.$cordovaOauth.facebook(this.$config.facebook.clientId,['email']).then(function(result) {
        alert(JSON.stringify(result));
    }, function(error) {
        alert(error);
    });
  

};
angular.module('social',['ngCordova','config'])
.service('FaceBookService',['$q','$cordovaOauth','$config',FaceBookService]);