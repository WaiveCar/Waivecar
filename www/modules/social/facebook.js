function FaceBookService ($q,$auth) {
	this.$q=$q;
	this.$auth=$auth;
}
FaceBookService.prototype.getFacebookInfo = function() {
 this.$auth.authenticate('facebook')
  .then(function(){
    alert('FB OK');
  })
  .catch(function(response){
    alert("ERROR");
    alert(JSON.stringify(response));
  })
};
angular.module('social',['satellizer','config'])
.config(function($authProvider,$configProvider){
	this.$authProvider=$authProvider;
	var socialConfig={
      popupOptions: {
        location: 'no',
        toolbar: 'no',
        width: window.screen.width,
        height: window.screen.height,
      },
      redirectUri:'http://localhost/'
    };
    if (ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
      $authProvider.platform = 'mobile';
      socialConfig.redirectUri = 'http://localhost/';
    }
    var clientId= $configProvider.configData.satellizer.facebook.clientId;
    $authProvider.facebook(angular.extend({}, socialConfig, {
      clientId: clientId,
      responseType: 'token'
    }));
})
.service('FaceBookService',['$q','$auth',FaceBookService]);