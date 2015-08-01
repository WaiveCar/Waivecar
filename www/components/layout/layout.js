function headerBarDirective(layoutIcons){
	var link=function(scope, element, attrs, ctrl) {
		var button=element.find('button');
		var icon=scope.icon;
		if(typeof icon =='undefned' || !icon ){
			icon=layoutIcons[scope.type];
		}
		button.addClass(icon);
		button.on('click',scope.onButtonClick)
	}
	return {
		link:link,
		templateUrl:'/components/layout/templates/directives/headerBar.html',
		scope:{
			icon:'@',
			type:'@',
			onButtonClick:'&'
		},
		transclude: true,
		replace: true
	}
}
angular.module('layout',[])
.constant('layoutIcons',{
	'close':'ion-close',
	'nav':'ion-navicon'
})
.directive('headerBar', [
	'layoutIcons',
	headerBarDirective
]);
