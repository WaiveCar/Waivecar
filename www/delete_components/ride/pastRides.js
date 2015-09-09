function rideSummaryDirective(){
  function link(scope){
	  scope.rideTime='Saturday, February 16th ,2015',
	  scope.rideLocation='246 Made up Street, San Francisco'
  }
  return {
	scope:true,
	link:link,
	templateUrl: 'components/ride/templates/directives/rideSummary.html'
  }
}
function timeAndDistanceDirective(){
 function link(scope){
	  scope.time= '1 hour 30 minutes',
	  scope.distance= '5 miles'
  }
  return {
	scope:true,
	link:link,
	templateUrl: 'components/ride/templates/directives/timeAndDistanceSummary.html'
  }
}
function feesDirective(){
 function link(scope){
	  scope.fees=[
		{
			title:'Low battery',
			ammount:20
		},
		{
			title:'1 hour extra time',
			ammount:30
		}
	  ];
	  scope.total=50;
  }
  return {
	scope:true,
	link:link,
	templateUrl: 'components/ride/templates/directives/feesSummary.html'
  }
}
function pointsSummaryDirective(){
	 function link(scope){
	  scope.points=[
	  	{
			title:'Charging station',
			ammount:500
		},
		{
			title:'Quick ride',
			ammount:50
		},
		{
			title:'Low battery',
			ammount:-50
		}
	  ];
	  scope.total=500;
  }
  return {
	scope:true,
	link:link,
	templateUrl: 'components/ride/templates/directives/pointsSummary.html'
  }
}
angular.module('app')
.directive('timeAndDistanceSummary',timeAndDistanceDirective)
.directive('feesSummary',feesDirective)
.directive('pointsSummary',pointsSummaryDirective)
.directive('rideSummary',rideSummaryDirective);