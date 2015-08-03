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
		// var img=element.find('img');
		// scope.getSetPictureFunction(function(){
		// 	return function(imgData){

		// 	}
		// })
		console.log(scope.damageImage);
	};
	return {
		link:link,
		restrict:'E',
   		templateUrl : 'components/cars/templates/directives/pictureContainer.html',
   		scope:{
   			// 'getSetPictureFunction': '&'
   			'damageImage':'@'
   		}
	}
}
function DamageController($scope,CameraService){
	this.$scope=$scope;
	this.CameraService=CameraService;
}
DamageController.prototype.takePictureOfDamage = function() {
	console.log('HERE');
	var self=this;
	this.CameraService.getPicture.then(function(picture){
		self.damageImage=picture;
	})
};
angular.module('app')
.controller('damageController',['$scope','CameraService',DamageController])
.directive('pictureContainer',[pictureContainerDirective])
.directive('takePicture',[takePictureDirective]);