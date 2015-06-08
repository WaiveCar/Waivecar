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

var GM_ASYNC_SUCCESS='success';
var GM_ASYNC_FAILURE='failure';
var GM_ASYNC_IN_PROGRESS='inProgress';
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
            deferred.reject({error:error,response:response,body:body});
            return;
        }
        deferred.resolve({body:body,response:response});
    });
    return deferred.promise;
};

VehicleService.prototype.makeAsyncRequest = function(path,options) {
    var self=this;
    function checkResponse(deferred,url){
        var asyncOptions={
            url:url,
            headers:{
                'Authorization':options.headers.Authorization
            }
        }
        self.makeRequest(null,asyncOptions).then(function(data){
            var bodyData=JSON.parse(data.body);
            var commandResponse=bodyData.commandResponse;
            if(commandResponse.status==GM_ASYNC_IN_PROGRESS){
                setTimeout(function(){checkResponse(deferred,commandResponse.url)}, 5000);
            }
            if(commandResponse.status==GM_ASYNC_FAILURE){
                deferred.reject(commandResponse);
            }
            if(commandResponse.status==GM_ASYNC_SUCCESS){
                deferred.resolve(commandResponse);
            }
        })
        .catch(function(error){
            deferred.reject(error);
        });
    }
    return this.makeRequest(path,options).then(function(data){
        
        var bodyData=JSON.parse(data.body);
        var asyncUrl=bodyData.url;
        var commandResponse=bodyData.commandResponse;
        var deferred=q.defer();
        setTimeout(function(){checkResponse(deferred,commandResponse.url)}, 5000);
        return deferred.promise;
        

    });
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
        return JSON.parse(response.body)
    });
};
VehicleService.prototype.getVehicleDiagnostics = function(vin) {
    var self=this;
    var bodyStr=JSON.stringify({
          "diagnosticsRequest": {
                "diagnosticItem": [
                        "FUEL TANK INFO",
                        // "LAST TRIP DISTANCE",
                        // "LAST TRIP FUEL ECONOMY",
                        // "LIFETIME FUEL ECON",
                        // "LIFETIME FUEL USED",
                        // "ODOMETER",
                        "OIL LIFE",
                        "TIRE PRESSURE",
                        "VEHICLE RANGE",
                        "EV BATTERY LEVEL",
                        "EV CHARGE STATE",
                        "EV ESTIMATED CHARGE END"
                    ]
                }

    });
    function parseResponse(response,elementName){
        var ret={

        };
        response.forEach(function(d){
            var key=d.name;
            if(d[elementName].length==1){
                delete d[elementName][0].name;
                ret[key]=d[elementName][0];
                return;
            }
            var obj={};
            d[elementName].forEach(function(el){
                obj[el.name]=el;

                delete obj[el.name].name;

            });
            ret[key]=obj;
        });
        return ret;
    };
    return this.connect().then(function(bearerToken){
        // account/vehicles/{vin}/commands/location
        var path='account/vehicles/'+vin+'/commands/diagnostics';
        var options={
            'headers':{
                'Authorization':'Bearer '+bearerToken
            },
            method:'POST',
            body:bodyStr
        };
        return self.makeAsyncRequest(path,options);
    })
    .then(function(response){
        // console.log(JSON.stringify(response.body.diagnosticResponse));
        return parseResponse(response.body.diagnosticResponse,'diagnosticElement');
    });
};
VehicleService.prototype.getVehicleLocation = function(vin) {
    var self=this;
    return this.connect().then(function(bearerToken){
        // account/vehicles/{vin}/commands/location
        var path='account/vehicles/'+vin+'/commands/location';
        var options={
            'headers':{
                'Authorization':'Bearer '+bearerToken
            },
            method:'POST',
        };
        return self.makeAsyncRequest(path,options);
    })
    .then(function(response){
        console.log(response);
        return true;
    });
};
VehicleService.prototype.getVehicleInfo = function(vin) {
    var self=this;
    return this.connect().then(function(bearerToken){
        var path='account/vehicles/'+vin;
        var options={
            'headers':{
                'Authorization':'Bearer '+bearerToken
            }
        };
        return self.makeRequest(path,options);
    })
    .then(function(response){
        return JSON.parse(response.body)
    });
};
VehicleService.prototype.getVehicleCapabilities = function(vin) {
    var self=this;
        var path='vehicles/'+vin+'/capabilities';
        var options={
            'headers':{
            }
        };
    var request= self.makeRequest(path,options);

    return request.then(function(response){
        return JSON.parse(response.body)
    });
};
VehicleService.prototype.unlockDoor = function(vin) {
    var self=this;
    return this.connect().then(function(bearerToken){
        var bodyStr=JSON.stringify({
            "unlockDoorRequest": {
                "delay": "0"
            }
        });
        var path='account/vehicles/'+vin+'/commands/unlockDoor';
        var options={
            'headers':{
                'Authorization':'Bearer '+bearerToken,
                'content-type': 'application/json'
            },
            method:'POST',
            body:bodyStr
        };
        return self.makeAsyncRequest(path,options);
    })
    .then(function(response){
        return true;
    });
};
VehicleService.prototype.lockDoor = function(vin) {
    var self=this;
    return this.connect().then(function(bearerToken){
        var bodyStr=JSON.stringify({
            "lockDoorRequest": {
                "delay": "0"
            }
        });
        var path='account/vehicles/'+vin+'/commands/lockDoor';
        var options={
            'headers':{
                'Authorization':'Bearer '+bearerToken,
                'content-type': 'application/json'
            },
            method:'POST',
            body:bodyStr


        };
        return self.makeAsyncRequest(path,options);
    })
    .then(function(response){
        return true;
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
