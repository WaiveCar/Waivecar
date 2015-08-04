function takePictureDirective(){
	var link=function(scope, element, attrs, ctrl){

	};
	return {
		link:link,
		restrict:'E',
   		templateUrl : 'components/cars/templates/directives/takePicture.html',
   		scope:{
   			'onTakePicture': '&'
   		}
	}
}
function damageInfoContainerDirective(){
	var link=function(scope, element, attrs, ctrl){
		var img=element.find('img')[0];
		scope.getSetPictureFunction({setFn: function(base64Img){
				img.setAttribute('src',base64Img);
			}
		});
	};
	return {
		link:link,
		restrict:'E',
   		templateUrl : 'components/cars/templates/directives/damageInfoContainer.html',
   		scope:{
   			//We are passing the function to the controller, setting ng-src as a scope parameter did not work.
   			'getSetPictureFunction': '&',
   			'damageDescription':'='
   		}
	}
}
function sendReportDirective(){
	return {
		restrict:'E',
   		templateUrl : 'components/cars/templates/directives/sendReport.html',
   		scope:{
   			'onSendReport': '&',
   		}
	}
}
function DamageController($rootScope,$scope,CameraService){
	this.$scope=$scope;
	this.$rootScope=$rootScope;
	this.CameraService=CameraService;
	this.description='';
	this.pictureURI=null;
}
DamageController.prototype.setPicture = function(setFn) {
	this.setPictureFunction=setFn;
};
DamageController.prototype.takePictureOfDamage = function() {
	var self=this;
	this.CameraService.getPicture().then(function(picture){
		self.pictureURI=picture;
		self.setPictureFunction(picture);
	})
	.catch(function(error){
		alert(error);
	})
};
DamageController.prototype.sendReport = function() {
	this.CameraService.savePicture(this.pictureURI);
};

angular.module('app')
.controller('damageController',['$rootScope','$scope','CameraService',DamageController])
.directive('damageInfoContainer',[damageInfoContainerDirective])
.directive('sendReport',[sendReportDirective])
.directive('takePicture',[takePictureDirective]);