var errorBuffer='';
function debugLog(text){
	
	var el=document.getElementById("debugText");
	if(!el){
		errorBuffer+=text;
		return;
	}
	el.asasaassa+='aassa';
	el.innerHTML+=errorBuffer+text+"\n";
};
var goErrHandler=window.onerror;
goErrHandler= function(msg, url, linenumber) {
	debugLog('Error message: '+msg+'\nURL: '+url+'\nLine Number: '+linenumber);
	return true;
};

(function() {
	

	function GMapsLoader(){
		function loadScript(){
			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&callback=waiveCar_gMapsLoadCb';
			debugLog("Loading gMap");
			document.body.appendChild(script);
		}
		var options;
		return{
			$get:function($q,$window){
				
			    var deferred = $q.defer();
			 	$window.waiveCar_gMapsLoadCb = function() {
			 		debugLog("Map loadded");
			 		debugLog(google.maps);
                    deferred.resolve(google.maps);
                }
				loadScript();
				return {
					getMap:deferred.promise
				}
			},
			setOption:function(){
				//TBD
			}
		}
	}
	angular.module('GMaps', [])
	.provider('waiveCar_GMapsLoader',GMapsLoader);
}
)();