function CameraService($cordovaCamera){
	this.$cordovaCamera=$cordovaCamera;
}
CameraService.prototype.getPicture = function() {
	var options = {
		quality : 75,
		destinationType : Camera.DestinationType.DATA_URL,
		sourceType : Camera.PictureSourceType.CAMERA,
		allowEdit : true,
		encodingType: Camera.EncodingType.JPEG,
		targetWidth: 100,
		targetHeight: 100,
		saveToPhotoAlbum: false,
		correctOrientation: true,
		cameraDirection : Camera.Direction.BACK,
	}
	return  this.$cordovaCamera.getPicture(options);
};
angular.module('Camera',[])
.service('CameraService',['$cordovaCamera',CameraService]);