function CameraService($cordovaCamera,$q){
	this.$cordovaCamera=$cordovaCamera;
	this.$q=$q;
}
CameraService.prototype.getPicture = function(width,height) {
	if(typeof Camera =='undefined'){
		return this.$q.reject("This feature just works on mobile");
	}
	var options = {
		quality : 75,
		destinationType : Camera.DestinationType.FILE_URI,
		sourceType : Camera.PictureSourceType.CAMERA,
		encodingType: Camera.EncodingType.JPEG,
		targetWidth: width || 800,
		targetHeight: height || 800,
		saveToPhotoAlbum: false,
		correctOrientation: true,
		cameraDirection : Camera.Direction.BACK,
	}
	return  this.$cordovaCamera.getPicture(options);
};
angular.module('Camera',[])
.service('CameraService',['$cordovaCamera','$q',CameraService]);