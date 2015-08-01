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
angular.module('layout',[])
.directive('overlayDialog',dialogDirective)
.constant('layoutIcons',{
	'close':'ion-close',
	'nav':'ion-navicon'
})
.directive('headerBar', [
	'layoutIcons',
	headerBarDirective
]);
