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
function pictureContainerDirective(){
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
   		templateUrl : 'components/cars/templates/directives/pictureContainer.html',
   		scope:{
   			//We are passing the function to the controller, setting ng-src as a scope parameter did not work.
   			'getSetPictureFunction': '&'
   			// 'damageImage':'@'
   		}

	}
}
function DamageController($rootScope,$scope,CameraService){
	this.$scope=$scope;
	this.$rootScope=$rootScope;
	this.CameraService=CameraService;
}
DamageController.prototype.setPicture = function(setFn) {
	this.setPictureFunction=setFn;
};
DamageController.prototype.takePictureOfDamage = function() {
	var self=this;

	this.CameraService.getPicture().then(function(picture){
		self.setPictureFunction(picture);
	})
};
angular.module('app')
.controller('damageController',['$rootScope','$scope','CameraService',DamageController])
.directive('pictureContainer',[pictureContainerDirective])
.directive('takePicture',[takePictureDirective]);