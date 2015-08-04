function CameraService($cordovaCamera,$q,$config){
	this.$cordovaCamera=$cordovaCamera;
	this.$q=$q;
	this.fileUploadURL=$config.uri.api+'/files/local';
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
CameraService.prototype.savePicture = function(fileUri) {
	var options = new FileUploadOptions();
	options.fileKey="files";
	options.fileName=fileUri.substr(fileUri.lastIndexOf('/')+1);
	options.mimeType="image/jpeg";
	var ft = new FileTransfer();
	var defered=this.$q.defer();
	var successCb=function(data){
		alert(arguments);
		defered.resolve(data);
	}
	var errorCb=function(data){
		alert(arguments);
		defered.reject(data);
	}
    ft.upload(imageURI, encodeURI(this.fileUploadURL), successCb, errorCb, options);
    return defered.promise;
};
angular.module('Camera',[])
.service('CameraService',['$cordovaCamera','$q','$config',CameraService]);