/**
* Provides reusable directives for layout pieces
*/
function headerBarDirective(layoutIcons){
	var link=function(scope, element, attrs, ctrl) {
		var button=element.find('button');
		var icon=scope.icon;
		if(typeof icon =='undefined' || !icon ){
			icon=layoutIcons[scope.type];
		}
		if(scope.showNav!==false){
			scope.showNav=true;
		}
		button.addClass(icon);
		button.on('click',scope.onButtonClick)
	}
	return {
		link:link,
		// template:'<ion-header-bar class="bar bar-header bar-light  disable-user-behavior">  <div class="header-text">    <h1 class="header-title"  ng-transclude></h1>  </div>  <button class="button button-right  button-icon icon" ng-click="showNav()">      </button></ion-header-bar>',
		templateUrl:'/components/layout/templates/directives/headerBar.html',
		scope:{
			icon:'@',
			type:'@',
			avatar:'@',
			onButtonClick:'&',
		},
		transclude: true,
		replace: true
	}
}
function stepByStepDirective(){
	function link(scope){
		if(typeof scope.currentStep=='undefined' || scope.currentStep<=0){
			scope.currentStep=1;
		}
		if(scope.currentStep>4){
			scope.currentStep=4;
		}
		for(var i=0;i<scope.currentStep;i++){
			scope['step'+(i+1)]='passed';
		}
	}
	return {
		restrict:'E',
		replace: true,
		link:link,
		scope:{
			currentStep:'@',
		},
		templateUrl:'/components/layout/templates/directives/stepByStep.html'
	}
}
function dialogDirective(){
	return {
		restrict:'E',
		scope:{
			title:'@',
			subtitle:'@',
			buttonText:'@',
			setDisplayFunction: '&',
			setHideFunction: '&',
			onButtonClick:'&'
		},
		link: function(scope, element, attrs){
			// alert("ON LINK");
			scope.setDisplayFunction({'fn':function(){
						// alert("On set dísplay");
						// alert(element[0].firstChild);
						//             alert(element[0].firstChild.style);

				element[0].firstChild.style.display="block";
				// alert("Done");

			}});
			scope.setHideFunction({'fn':function(){
				element[0].firstChild.style.display="none";
			}});
		},
		templateUrl:'/components/layout/templates/directives/overlay-dialog.html'
	}
}
function bestFitTextDirective(){
	return {
				restrict: 'A',
				link:function(scope, element, attrs, ctrl){
						var text=element[0].firstChild.textContent.trim();
						var width=element[0].clientWidth;
						var height=element[0].clientHeight;
						var numChars=text.length;
						var desiredFontSize=height;
						var numLines=1;
						if(desiredFontSize*numChars>width ){
								var minFontSize=numChars/width;
								var maxFontSize=desiredFontSize;
								var ratio=height/width;
								var wordsSizes=[];
								var words=text.split(' ');
								words.forEach(function(w){
									wordsSizes.push(w.length);
								});
								var numActualLines;
								var expectedSize;
								while(numActualLines>numLines || typeof(numActualLines)=='undefined'){
									numActualLines=0;
									expectedSize=height/numLines;
									var charsPerLine=width/expectedSize;
									var numChars=0;
									wordsSizes.forEach(function(w){
										numChars+=w+1;
										while(numChars>charsPerLine){
											numChars=numChars-(charsPerLine+1);
											numActualLines++;
										}
									});                
									numLines++;
								}
								numLines--;
								desiredFontSize=expectedSize;

						}

					var str=element
					element[0].style.fontSize=desiredFontSize+"px";
					element[0].style.lineHeight=((height)/numLines)+"px";
					console.log("HEIUH "+((height)/numLines)+"px");
					console.log(height);
					console.log(numLines);
					element[0].style.verticalAlign = "middle";
				},
	 }
}
function SplashScreenController(WaiveCarStateService,$timeout){
	$timeout(function(){WaiveCarStateService.next()}, 1500);
}
function strikeDirective(){
	return {
		restrict:'E',
		templateUrl:'/components/layout/templates/directives/strike.html'

	}
}
function lineOnTheSidesDirective(){
	return{
		restrict:'E',
		transclude:true,
		replace:true,
		templateUrl:'/components/layout/templates/directives/lineOnTheSides.html'

	}
}
function pageTitleDirective(){
	return {
		restrict:'E',
		transclude:true,
		scope:{
			'backButton':'@'
		},
		templateUrl:'/components/layout/templates/directives/pageTitle.html'

	}
}
function bottomToastDirective(){
	return {
		restrict:'E',
		transclude:true,
		
		templateUrl:'/components/layout/templates/directives/bottomToast.html'

	}
}
angular.module('layout',['WaiveCar.state'])
.controller('SplashScreenController', [
	'WaiveCarStateService',
	'$timeout',
	SplashScreenController
])

.directive('overlayDialog',dialogDirective)
.constant('layoutIcons',{
	'close':'ion-close',
	'nav':'ion-navicon'
})
.directive('headerBar', [
	'layoutIcons',
	headerBarDirective
])
.directive('bestFit', [
	bestFitTextDirective
])
.directive('stepByStep',[
	stepByStepDirective
])
.directive('lineOnTheSides',[
	lineOnTheSidesDirective
])
.directive('strike',[
	strikeDirective
])
.directive('bottomToast',
	[bottomToastDirective
])
.directive('pageTitle',[
	pageTitleDirective
]);