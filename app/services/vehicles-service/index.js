var GM_ASYNC_SUCCESS='success';
var GM_ASYNC_FAILURE='failure';
var GM_ASYNC_IN_PROGRESS='inProgress';
var GM_ALERT_HONK='Honk';
var GM_ALERT_FLASH='Flash';
var request=require('request');
var q=require('q');
var _=require('lodash');
var async=require('async');
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
    this._asyncDelay=5000;
    this._defaultAlertDuration=15;
}

VehicleService.prototype.makeRequest = function(path,options,cb) {
    var defaultHeaders={
        'Accept':'application/json',
    };
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
    request(options, function (error, response, body) {
        if(error ||   response && (response.statusCode !== 200 && response.statusCode !== 202)){
            var statusCode=response && response.statusCode;
            cb({error:error,response:response,body:body});
            return;
        }
        cb(null,{body:body,response:response});
    });
};

VehicleService.prototype.makeAsyncRequest = function(path,options,cb) {
    var self=this;
    function checkResponse(url,cb){
        var asyncOptions={
            url:url,
            headers:{
                'Authorization':options.headers.Authorization
            }
        };
        var requestCb=function(err,data){
            if(err){
                cb(err);
                return;
            }
            var bodyData=JSON.parse(data.body);
            var commandResponse=bodyData.commandResponse;
            if(commandResponse.status===GM_ASYNC_IN_PROGRESS){
                var timeoutFn=function(){
                    checkResponse(url,cb);
                };
                setTimeout(timeoutFn, self._asyncDelay);
            }
            if(commandResponse.status===GM_ASYNC_FAILURE){
                cb(commandResponse);
            }
            if(commandResponse.status===GM_ASYNC_SUCCESS){
                cb(null,commandResponse);
            }
            
        }
        self.makeRequest(null,asyncOptions,requestCb);
     
    }
    var requestCb=function(err,data){
        if(err){
            cb(err);
            return;
        }
        var bodyData=JSON.parse(data.body);
        var asyncUrl=bodyData.url;
        var commandResponse=bodyData.commandResponse;
        var deferred=q.defer();
        var timeoutFn=function(){
            checkResponse(commandResponse.url,cb);
        };
        setTimeout(timeoutFn, this._asyncDelay);
        
    }
    this.makeRequest(path,options,requestCb);
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

VehicleService.prototype.connect = function(cb) {
    var self=this;
    
    if(!this.isTokenExpired()){
        cb(null,self.getBearerToken());
        return;
    }
    var options={
        'headers':{
            'Authorization':'Basic '+this._base64KeyAndSecret
        }
    };
    var requestCb=function(err,res){
        if(err){
            cb(err);
            return;
        }
        var data=JSON.parse(res.body);
        self._setBearerToken(data);
        cb(null,self.getBearerToken());
        
    }
    this.makeRequest('oauth/access_token',options,requestCb);
};

VehicleService.prototype.cancelStartEngine = function(vin,cb) {

    var self=this;
    async.auto({
        'connect':function(asyncCb){
            self.connect(asyncCb);
        },
        'request':['connect',function (asyncCb,result) {
            var bearerToken=result.connect;
            var path='account/vehicles/'+vin+'/commands/cancelStart';
            var options={
                'headers':{
                    'Authorization':'Bearer '+bearerToken
                },
                method:'POST',
            };
            self.makeAsyncRequest(path,options,asyncCb);
        }]
    },
    function(err,result){
        if(err){
            cb(err);
            return;
        }
        cb(null,true);
    });
};
VehicleService.prototype.startEngine = function(vin,cb) {
    var self=this;
    async.auto({
        'connect':function(asyncCb){
            self.connect(asyncCb);
        },
        'request':['connect',function (asyncCb,result) {
            var bearerToken=result.connect;
            var path='account/vehicles/'+vin+'/commands/start';
            var options={
                'headers':{
                    'Authorization':'Bearer '+bearerToken
                },
                method:'POST',
            };
            self.makeAsyncRequest(path,options,asyncCb);
        }]
    },
    function(err,result){
        if(err){
            cb(err);
            return;
        }
        cb(null,true);
    });
};
VehicleService.prototype.listVehicles = function(cb) {
    var self=this;
    async.auto({
        connect:function(asyncCb){
            self.connect(asyncCb);
        },
        list:['connect',function(asyncCb,result){
            var bearerToken=result.connect;
            var path='account/vehicles';
            var options={
                'headers':{
                    'Authorization':'Bearer '+bearerToken
                }
            };
            self.makeRequest(path,options,asyncCb);
        }]
    },
    function(err,result){
        console.log("AQUI "+!!err+"  "+!!result);
        if(err){
            cb(err);
            return;
        }
        var data=JSON.parse(result.list.body);
        cb(null,data);
    });
};
VehicleService.prototype.getVehicleDiagnostics = function(vin,cb,diagnostItems) {
    if(!diagnostItems){
       diagnostItems= [
            'FUEL TANK INFO',
            // 'LAST TRIP DISTANCE',
            // 'LAST TRIP FUEL ECONOMY',
            // 'LIFETIME FUEL ECON',
            // 'LIFETIME FUEL USED',
            'ODOMETER',
            'OIL LIFE',
            'TIRE PRESSURE',
            'VEHICLE RANGE',
            'EV BATTERY LEVEL',
            'EV CHARGE STATE',
            'EV ESTIMATED CHARGE END'
        ]
    }
    var self=this;
    var bodyStr=JSON.stringify({
          'diagnosticsRequest': {
                'diagnosticItem':diagnostItems
            }

    });
    function parseResponse(response,elementName){
        var ret={

        };
        response.forEach(function(d){
            var key=d.name;
            if(d[elementName].length===1){
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
    }
    
    async.auto({
        connect:function(asyncCb){
            self.connect(asyncCb);
        },
        request:['connect',function(asyncCb,result){
            var path='account/vehicles/'+vin+'/commands/diagnostics';
            var options={
                'headers':{
                    'Authorization':'Bearer '+result.connect
                },
                method:'POST',
                body:bodyStr
            };
            self.makeAsyncRequest(path,options,asyncCb);
        }],
        parse:['request',function(asyncCb,result){
             var response=parseResponse(result.request.body.diagnosticResponse,'diagnosticElement');
            cb(null,response);
        }]
    },
    function(err,result){
        if(err){
            cb(err);
            return;
        }
        cb(null,result.parse);
    }
    );   
};
VehicleService.prototype.getVehicleLocation = function(vin,cb) {
    var self=this;
    async.auto({
        'connect':function(asyncCb){
            self.connect(asyncCb);
        },
        'request':['connect',function (asyncCb,result) {
            var bearerToken=result.connect;
            var path='account/vehicles/'+vin+'/commands/location';
            var options={
                'headers':{
                    'Authorization':'Bearer '+bearerToken
                },
                method:'POST',
            };
            return self.makeAsyncRequest(path,options,asyncCb);
        }]
    },
    function(err,result){
        if(err){
            cb(err);
            return;
        }
        cb(null,result.response);
    });
};
VehicleService.prototype.getVehicleInfo = function(vin,cb) {
    var self=this;
    async.auto({
        connect:function(asyncCb){
            self.connect(asyncCb);
        },
        'request':['connect',function(asyncCb,result){
            var bearerToken=result.connect;
             var path='account/vehicles/'+vin;
            var options={
                'headers':{
                    'Authorization':'Bearer '+bearerToken
                }
            };
            self.makeRequest(path,options,asyncCb);
        }]
    },function(err,results){
        if(err){
            cb(err);
            return;
        }
        var response=JSON.parse(results.request.body);
        cb(null,response);
    });
};
VehicleService.prototype.getVehicleCapabilities = function(vin,cb) {
    var self=this;
    var path='vehicles/'+vin+'/capabilities';
    var options={
        'headers':{
            'Authorization':'Basic '+this._base64KeyAndSecret
        }
    };
    async.auto({
        request:function(asyncCb){
            self.makeRequest(path,options,asyncCb);
        },
        response:['request',function(asyncCb,result){
            cb(null,JSON.parse(result.request.body));
        }]
    },
    function(err,result){
        if(err){
            cb(err);
            return;
        }
        cb(null,result.response);
    });
};
VehicleService.prototype.unlockDoor = function(vin,cb) {
    var self=this;
    async.auto({
        'connect':function(asyncCb){
            self.connect(asyncCb);
        },
        'request':['connect',function (asyncCb,result) {
            var bearerToken=result.connect;
            var bodyStr=JSON.stringify({
                'unlockDoorRequest': {
                    'delay': '0'
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
            self.makeAsyncRequest(path,options,asyncCb);
        }]
    },
    function(err,result){
        if(err){
            cb(err);
            return;
        }
        cb(null,true);
    });
};
VehicleService.prototype.lockDoor = function(vin,cb) {
    var self=this;
    async.auto({
        'connect':function(asyncCb){
            self.connect(asyncCb);
        },
        'request':['connect',function (asyncCb,result) {
            var bearerToken=result.connect;
            var bodyStr=JSON.stringify({
                'lockDoorRequest': {
                    'delay': '0'
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
            self.makeAsyncRequest(path,options,asyncCb);
        }]
    },
    function(err,result){
        if(err){
            cb(err);
            return;
        }
        cb(null,true);
    });
    
};

VehicleService.prototype._makeAlerts = function(vin,duration,action,cb) {
    var self=this;
    duration=duration || this._defaultAlertDuration;
    if(!Array.isArray(action)){
        action=[action];
    }
    var override= [
        "DoorOpen",
        "IgnitionOn"
    ];
    var request= {
        "alertRequest": {
            "delay": "0",
            "duration": duration,
            "action": action,
            "override":override
        }
    };
    var bodyStr=JSON.stringify(request);
    async.auto({
        connect:function(asyncCb){
            self.connect(asyncCb);
        },
        request:['connect',function(asyncCb,result){
            var bearerToken=result.connect;
            var path='account/vehicles/'+vin+'/commands/alert';
            var options={
                'headers':{
                    'Authorization':'Bearer '+bearerToken
                },
                method:'POST',
                body:bodyStr
            };
            return self.makeAsyncRequest(path,options,asyncCb);
        }]
    },
     function(err,result){
        if(err){
            cb(err);
            return;
        }
        cb(null,true);
    });
};
VehicleService.prototype.honk = function(vin,cb,duration) {
    this._makeAlerts(vin,duration,GM_ALERT_HONK,cb);
};
VehicleService.prototype.flash = function(vin,cb,duration) {
    return this._makeAlerts(vin,duration,GM_ALERT_FLASH,cb);
};
VehicleService.prototype.honkAndFlash = function(vin,cb,duration) {
    return this._makeAlerts(vin,duration,[GM_ALERT_HONK,GM_ALERT_FLASH],cb);
};

VehicleService.prototype.vehicleData = function(vin,cb) {
     var request= {
        "dataServices": {
            'dataService':[
                {
                    serviceCode:'TELEMETRY'
                    notification:{
                        type:'PUSH'
                    }
                },
                {
                    serviceCode:'HARD_BRAKE'
                }
            ]
            "delay": "0",
            "duration": duration,
            "action": action,
            "override":override
        }
    };
    var bodyStr=JSON.stringify(request);
    async.auto({
        connect:function(asyncCb){
            self.connect(asyncCb);
        },
        request:['connect',function(asyncCb,result){
            var bearerToken=result.connect;
            var path='account/vehicles/'+vin+'/data/services';
            var options={
                'headers':{
                    'Authorization':'Bearer '+bearerToken
                },
                method:'POST',
                body:bodyStr
            };
            return self.makeAsyncRequest(path,options,asyncCb);
        }]
    },
     function(err,result){
        if(err){
            cb(err);
            return;
        }
        console.log(result.request);
        cb(null,true);
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
