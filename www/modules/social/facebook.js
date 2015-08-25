function FaceBookService ($q,$config) {
	this.$q=$q;
	this.$config = $config;
}
FaceBookService.prototype.getFacebookInfo = function() {
	return this.getFacebookCode(this.$config.facebook.clientId).then(function(result) {

		return result;
	}, function(error) {
		alert("ERROR");
	   return error;
	});
};
FaceBookService.prototype.getFacebookCode = function(clientId, appScope, options) {
	var deferred = this.$q.defer();
	var redirect_uri = "http://localhost";
	var response_type = "code";
	if(options !== undefined) {
		if(options.hasOwnProperty("redirect_uri")) {
			redirect_uri = options.redirect_uri;
		}
		
	}

	var flowUrl = "https://www.facebook.com/dialog/oauth?client_id=" + clientId + "&redirect_uri=" + redirect_uri + "&response_type=code";
	if(typeof appScope !='undefined'){
		flowUrl+="&scope=" + appScope.join(",");
	}
	if(options !== undefined && options.hasOwnProperty("auth_type")) {
		flowUrl += "&auth_type=" + options.auth_type;
	}
	prompt("",flowUrl);
	var browserRef = window.open(flowUrl, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
	browserRef.addEventListener('loadstart', function(event) {
		if((event.url).indexOf(redirect_uri) === 0) {
			prompt("",event.url);
			browserRef.removeEventListener("exit",function(event){});
			browserRef.close();
			var codeIndex=(event.url).indexOf("?code=");
			 if (codeIndex>=0){
			 	deferred.resolve(event.url.substring(codeIndex+6));
			 }
			else {
			  if ((event.url).indexOf("error_code=100") !== 0)
				deferred.reject("Facebook returned error_code=100: Invalid permissions");
			  else
				deferred.reject("Problem authenticating");
			}
		}
	});
	browserRef.addEventListener('exit', function(event) {
		deferred.reject("The sign in flow was canceled");
	});
	
	return deferred.promise;
};
angular.module('social',['ngCordova','config'])
.service('FaceBookService',['$q','$config',FaceBookService]);