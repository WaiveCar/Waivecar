angular.module('app.directives').directive('headerBar', [

  function () {
    'use strict';

    var icons = {
      'close': 'ion-close',
      'nav': 'ion-navicon'
    };

    var link = function (scope, element) {
      var button = element.find('button');
      var icon = scope.icon;

      if (!icon) {
        icon = icons[scope.type];
      }

      button.addClass(icon);
      button.on('click', scope.onButtonClick);

    };

    return {
      link: link,
      templateUrl: '/templates/directives/header-bar.html',
      scope: {
        icon: '@',
        type: '@',
        avatar: '@',
        onButtonClick: '&'
      },
      transclude: true,
      replace: true
    };

  }

]);
