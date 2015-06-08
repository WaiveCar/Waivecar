var request=require('request');
var q=require('q');
var _=require('lodash');
function VehicleService(config,logger){
	this._apiKey=config.vehiclesService.api.key;
	this._apiSecret=config.vehiclesService.api.secret;
	this._host=config.vehiclesService.host;
	this._base64KeyAndSecret=new Buffer(this._apiKey+':'+this._apiSecret).toString('base64');
	this._bearerToken;
	this._bearerExpiresIn;
	this._bearerReceivedAt;
	this._expiredLatency=5;
	this._logger=logger;
};
VehicleService.prototype.makeRequest = function(path,options) {
	var defaultHeaders={
		'Accept':'application/json',
	}
	var defaultOptions = {
		url: this._host+path,
		headers: {
			'Accept':'application/json',
		}
	};
	if(options){
		options=_.merge(defaultOptions,options);
	}
	else{
		options=defaultHeaders;
	}
	console.log(options);
	var deferred=q.defer();
	request(options, function (error, response, body) {
		if(error ||   response && (response.statusCode != 200 && response.statusCode != 202)){
			var statusCode=response && response.statusCode;
			deferred.reject({error:error,statusCode:statusCode});
			return;
		}
		deferred.resolve({body:body,response:response});
	});
	return deferred.promise;
};
VehicleService.prototype._setBearerToken = function(tokenData) {
	this._bearerToken=tokenData.access_token;
	this._bearerExpiresIn=tokenData.expires_in-this._expiredLatency;
	this._bearerReceivedAt=new Date().getTime();
};
VehicleService.prototype.getBearerToken = function() {
	return this._bearerToken;
};
VehicleService.prototype.isTokenExpired = function() {
	if(!this._bearerToken){
		return true;
	}
	var timeDiff=new Date().getTime()-this._bearerReceivedAt;
	return timeDiff/(1000*60)>this._bearerExpiresIn;
};
VehicleService.prototype.connect = function() {
	var self=this;
	
	if(!this.isTokenExpired()){
		return q.fcall(function(){
			return self.getBearerToken();
		});
	}
	var options={
		'headers':{
			'Authorization':'Basic '+this._base64KeyAndSecret
		}
	};
	return this.makeRequest('oauth/access_token',options).then(function(res){
		var data=JSON.parse(res.body);
		self._setBearerToken(data);
		return self.getBearerToken();
	})
	.catch(function (error) {
    	throw error;
	});

};
VehicleService.prototype.listVehicles = function() {
	var self=this;
	return this.connect().then(function(bearerToken){
		var path='account/vehicles';
		var options={
			'headers':{
				'Authorization':'Bearer '+bearerToken
			}
		};
		return self.makeRequest(path,options);

	})
	.then(function(response){
		console.log(response.body)	;
		return JSON.parse(response.body)
	})
	.catch(function (error) {
		console.log(error);
    	throw error;
	});
};
VehicleService.prototype.getVehicleCapabilities = function(vin) {
	var self=this;
		var path='vehicles/'+vin+'/capabilities';
		https://developer.gm.com/api/v1/account/vehicles/1GKUKEEF9AR000010
		var options={
			'headers':{
				'Authorization':'Basic '+this._base64KeyAndSecret
			}
		};
	var request= self.makeRequest(path,options);

	return request.then(function(response){
		console.log(response.body)	;
		return JSON.parse(response.body)
	})
	.catch(function (error) {
		console.log(error);
    	throw error;
	});
};
exports = module.exports = function(config, logger) {
	var service=new VehicleService(config,logger);
	return  service;
};

module.exports['@singleton'] = true;
module.exports['@require'] = [
  'igloo/settings',
  'igloo/logger'
];
