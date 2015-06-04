
(function() {
	

	function GMapsLoader(){
		function loadScript(){
			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&callback=waiveCar_gMapsLoadCb';
			document.body.appendChild(script);
		}
		var options;
		return{
			$get:function($q,$window){
				
			    var deferred = $q.defer();
			 	$window.waiveCar_gMapsLoadCb = function() {
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