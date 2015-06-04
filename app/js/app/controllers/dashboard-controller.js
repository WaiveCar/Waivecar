angular.module('app.admin.controllers').controller('DashboardController', [
  '$rootScope',
  '$scope',
  '$interval',
  '$account',
  '$state',
  '$http',
  '$notification',
  '$data',
  '$config',
  function ($rootScope, $scope, $interval, $account, $state, $http, $notification, $data, $config) {

    var statusTimer;

    $rootScope.$on('$stateChangeStart', function() {
      $interval.cancel(statusTimer);
    });

    $scope.search = {};
    $scope.searchReport = function() {
      if ($scope.search.reportId && $scope.search.reportId.length > 0) {
        $state.go('reports-show', { id: $scope.search.reportId });
      } else if ($scope.search.email && $scope.search.email.length > 0) {
        $data.init('reports', {
          filters: {
            'tracking.email': $scope.search.email
          }
        }, function(err, data) {
          if (err || !data || !data.models || data.models.length === 0) {
            $notification.error('Unable to retrieve Report. Please confirm details are correct and try again.');
            return;
          } else if (data.models.length === 1) {
            $state.go('reports-show', { id: data.models[0].id });
          } else {
            $state.go('reports', { email: $scope.search.email });
          }
        });
      }
    };

    $scope.load = {
      labels: [ 'Used Memory', 'Available Memory' ],
      data: [ 0, 100 ],
      options: {
        percentageInnerCutout : 70, // This is 0 for Pie charts
      },
      colors: [ '#009FDA', '#DADADA' ]
    };

    $scope.stats = {
      labels: [],
      series: [ 'Valid', 'Invalid' ],
      data: [ [], [] ]
    };

    $scope.goPendingMedia = function() {
      $state.go('media', { filters: { state: 'manual-pending' } });
    };

    $scope.fetch = function() {
      $http.get($config.uri.api + '/status').then(function(response) {
        // $scope.status = response.data;
        $scope.load.used = Math.round((response.data.memory.used / response.data.memory.total) * 100, 2);
        $scope.load.data[0] = response.data.memory.used;
        $scope.load.data[1] = response.data.memory.free;
        // $scope.stats.labels = _.pluck(response.data.report, 'date');
        // $scope.stats.data[0] = _.pluck(response.data.report, 'valid');
        // $scope.stats.data[1] = _.pluck(response.data.report, 'invalid');

        if (!statusTimer) {
          statusTimer = $interval($scope.fetch, 10000);
        }
      }).catch(function(err) {
        $notification.error(err);
      });
    };

    $scope.init = function() {
      if ($account.initialized) {
        $scope.fetch();
      } else {
        $scope.$watch(function() { return $account.initialized; }, function(data) {
          if (data === true) {
            $scope.fetch();
          }
        });
      }
    };

    $scope.init();
  }
]);
