angular.module('app.directives').directive('headerBar', [
  function () {

    var icons = {
      'close' : 'ion-close',
      'nav'   : 'ion-navicon'
    };

    var link = function(scope, element, attrs, ctrl) {
      var button = element.find('button');
      var icon   = scope.icon;

      if (typeof icon == 'undefined' || !icon ) {
        icon = icons[scope.type];
      }

      if (scope.showNav !== false) {
        scope.showNav = true;
      }

      button.addClass(icon);
      button.on('click', scope.onButtonClick);
    }
    return {
      link        : link,
      templateUrl : '/templates/directives/header-bar.html',
      scope       : {
        icon          : '@',
        type          : '@',
        avatar        : '@',
        onButtonClick : '&'
      },
      transclude : true,
      replace    : true
    }
  }
]);