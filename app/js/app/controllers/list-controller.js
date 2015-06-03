angular.module('app.admin.controllers').controller('ListController', [
  '$rootScope',
  '$scope',
  '$state',
  '$notification',
  '$ngBootbox',
  '$data',
  function ($rootScope, $scope, $state, $notification, $ngBootbox, $data) {

    $scope.data = $data.data;

    $scope.editable = {};

    $scope.list = {
      model: '',
      columns: [],
      total: -1,
      pagination: {
        currentPage: 1,
        limit: 25,
      },
      display: {
        filters: false,
        columns: false,
        actions: true,
        create: false,
        show: false,
        edit: true,
        destroy: true
      }
    };

    $scope.toggleFilters = function() {
      $scope.list.display.filters = !$scope.list.display.filters;
    };

    $scope.toggleColumns = function() {
      var tmpl = '/templates/table/column-chooser.html';
      $ngBootbox.dialog($scope.meta.route, null, null,  tmpl, $scope);
    };

    $scope.pagedDetails = function() {
      var from = (($scope.list.pagination.currentPage - 1) * $scope.list.pagination.limit) + 1;
      var to = $scope.list.pagination.currentPage * $scope.list.pagination.limit;
      if ($scope.list.total < to) to = $scope.list.total;
      return [ from, 'to', to, 'of', $scope.list.total, $scope.list.model ].join(' ');
    };

    $scope.request = {
      pagination: {
        page: 1,
        limit: $scope.list.pagination.limit
      }
    };

    $scope.prevPage = function() {
      $scope.list.pagination.currentPage = $scope.list.pagination.currentPage - 1;
      $scope.getPage();
    };

    $scope.nextPage = function() {
      $scope.list.pagination.currentPage = $scope.list.pagination.currentPage + 1;
      $scope.getPage();
    };

    $scope.sortColumn = function(col) {
      if (col.sortDirection === 'asc') {
        col.sortDirection = 'desc';
      } else {
        col.sortDirection = 'asc';
      }

      var sort = (col.sortDirection === 'asc' ? '' : '-') + col.name;
      _.each($scope.list.columns, function(c) {
        if (c.isSortable && c.name !== col.name) {
          if (_.isString(c.sortDirection) && c.sortDirection.length > 0) {
            sort = sort + ' ' + (c.sortDirection === 'asc' ? '' : '-') + c.name;
          }
        }
      });

      if ($scope.request.sort === sort) return;

      $scope.request.sort = sort;
      $scope.list.pagination.currentPage = 1;
      $scope.getPage();
    };

    $scope.getPage = function() {
      $scope.request.pagination.page = $scope.list.pagination.currentPage;
      $scope.request.pagination.limit = $scope.list.pagination.limit;
      $scope.list.total = -1;
      $data.init($scope.list.model, $scope.request, function(err, data) {
        $scope.list.total = data.itemCount;
        $scope.list.hasMore = data.hasMore;
        if ($scope.list.total > $scope.list.pagination.limit) {
          $scope.list.pagination.pageCount = Math.ceil($scope.list.total / $scope.list.pagination.limit);
        } else {
          $scope.list.pagination.pageCount = 1;
        }
      });
    };

    var defaultColumns = [
      { displayName: 'Created', name: 'createdAt', formatter: 'date', isSortable: true, isFilterable: false, isVisible: true },
      { displayName: 'Last Updated', name: 'updatedAt', formatter: 'date', isSortable: true, isFilterable: false, isVisible: true, sortDirection: 'desc' }
    ];

    $scope.getName = function(modelName, id, field) {
      var model = _.findWhere($scope.data[modelName], { id: id });
      if (model) return field ? model[field] : model.name;
      return 'Unknown';
    };

    $scope.format = {
      date: function(field) {
        if (!field) return '';
        return moment(field).format('YYYY-MM-DD hh:mm');
      },
      raw: function(field) {
        if (!field) return '';
        return field;
      },
      title: function(field) {
        if (!field) return '';
        return field.toUpperCase()[0] + field.toLowerCase().substring(1);
      },
      upper: function(field) {
        if (!field) return '';
        return field.toUpperCase();
      },
      count: function(field) {
        if (!field) return '';
        return field.length;
      },
      user: function(field) {
        if (!field) return '';
        return $scope.getName('users', field);
      },
      role: function(field) {
        if (!field) return '';
        return $scope.getName('roles', field);
      },
      roles: function(field) {
        if (!field) return '';
        var roles = [];
        _.each(field, function(id) { roles.push($scope.getName('roles', id)); });
        return roles.join(', ');
      },
      list: function(field) {
        if (!field) return '';
        return field.join(', ');
      }
    };

    $scope.init = function() {
      $scope.meta = {
        route: $state.current.name
      };

      if ($scope.meta.route !== 'blacklisted-emails') {
        $scope.meta.route = $scope.meta.route.split('-')[0];
      }

      // any defaults based on route.
      $scope.list.model = $scope.meta.route;
      switch ($scope.meta.route) {
        case 'media':
        {
          $scope.list.columns = [
            { displayName: 'Id', name: 'id', formatter: 'raw', isSortable: true, isFilterable: false, isVisible: true },
            { displayName: 'Filename', name: 'filename', formatter: 'raw', isSortable: true, isFilterable: true, isVisible: true },
            { displayName: 'Size', name: 'size', formatter: 'raw', isSortable: true, isFilterable: false, isVisible: true },
            { displayName: 'Children', name: 'children', formatter: 'count', isSortable: true, isFilterable: false, isVisible: false },
            { displayName: 'Validations', name: 'validations', formatter: 'list', isSortable: true, isFilterable: false, isVisible: true },
            { displayName: 'State', name: 'state', formatter: 'title', isSortable: true, isFilterable: true, isVisible: true },
            { displayName: 'Duration', name: 'duration', formatter: 'raw', isSortable: true, isFilterable: false, isVisible: true }
          ].concat(defaultColumns);
          $data.subscribe();
          break;
        }
        case 'users':
        {
          $scope.list.display.create = true;
          $scope.list.columns = [
            { displayName: 'Id', name: 'id', formatter: 'raw', isSortable: true, isFilterable: false, isVisible: false },
            { displayName: 'Email', name: 'email', formatter: 'raw', isSortable: true, isFilterable: true, isVisible: true },
            { displayName: 'First Name', name: 'firstName', formatter: 'raw', isSortable: true, isFilterable: true, isVisible: true },
            { displayName: 'Last Name', name: 'lastName', formatter: 'raw', isSortable: true, isFilterable: true, isVisible: true },
            { displayName: 'Prefix', name: 'phoneCountryCode', formatter: 'raw', isSortable: false, isFilterable: true, isVisible: true },
            { displayName: 'Phone', name: 'phoneNumber', formatter: 'raw', isSortable: false, isFilterable: true, isVisible: true },
            { displayName: 'Roles', name: 'roles', formatter: 'roles', isSortable: true, isFilterable: true, isVisible: true },
            { displayName: 'State', name: 'state', formatter: 'title', isSortable: true, isFilterable: true, isVisible: true }
          ].concat(defaultColumns);
          break;
        }
        case 'reports':
        {
          $scope.list.columns = [
            { displayName: 'Id', name: 'id', formatter: 'raw', isSortable: true, isFilterable: false, isVisible: false },
            { displayName: 'Name', name: 'name', formatter: 'raw', isSortable: true, isFilterable: true, isVisible: true },
            { displayName: 'Publication', name: 'publication', formatter: 'title', isSortable: true, isFilterable: true, isVisible: true },
            { displayName: 'User', name: 'email', formatter: 'raw', isSortable: true, isFilterable: true, isVisible: true },
            { displayName: 'Ip Address', name: 'ip', formatter: 'raw', isSortable: true, isFilterable: true, isVisible: false },
            { displayName: 'Web Browser', name: 'browser', formatter: 'raw', isSortable: true, isFilterable: true, isVisible: false },
            { displayName: 'Media Count', name: 'media', formatter: 'count', isSortable: false, isFilterable: false, isVisible: true },
            { displayName: 'State', name: 'state', formatter: 'title', isSortable: true, isFilterable: true, isVisible: true },
            { displayName: 'Duration', name: 'duration', formatter: 'raw', isSortable: true, isFilterable: false, isVisible: true }
          ].concat(defaultColumns);
          $data.subscribe();
          break;
        }
        case 'roles':
        {
          $scope.list.display.destroy = false;
          $scope.list.columns = [
            { displayName: 'Id', name: 'id', formatter: 'raw', isSortable: true, isFilterable: false, isVisible: false },
            { displayName: 'Name', name: 'name', formatter: 'title', isSortable: true, isFilterable: true, isVisible: true },
            { displayName: 'Description', name: 'description', formatter: 'raw', isSortable: true, isFilterable: true, isVisible: true },
            { displayName: 'Permissions', name: 'permissions', formatter: 'list', isSortable: true, isFilterable: true, isVisible: true }
          ].concat(defaultColumns);
          break;
        }
        case 'validations':
        {
          $scope.list.display.destroy = false;
          $scope.list.columns = [
            { displayName: 'Id', name: 'id', formatter: 'raw', isSortable: true, isFilterable: false, isVisible: false },
            { displayName: 'Code', name: 'code', formatter: 'raw', isSortable: true, isFilterable: true, isVisible: true },
            { displayName: 'Type', name: 'type', formatter: 'title', isSortable: true, isFilterable: true, isVisible: true },
            { displayName: 'Reason', name: 'reason', formatter: 'raw', isSortable: true, isFilterable: true, isVisible: true },
            { displayName: 'Message', name: 'message', formatter: 'raw', isSortable: true, isFilterable: true, isVisible: true },
            { displayName: 'KB', name: 'kb', formatter: 'raw', isSortable: true, isFilterable: true, isVisible: true }
          ].concat(defaultColumns);
          break;
        }
        case 'settings':
        {
          $scope.list.display.destroy = false;
          $scope.list.columns = [
            { displayName: 'Id', name: 'id', formatter: 'raw', isSortable: true, isFilterable: false, isVisible: false },
            { displayName: 'Name', name: 'name', formatter: 'upper', isSortable: true, isFilterable: true, isVisible: true },
            { displayName: 'Description', name: 'description', formatter: 'raw', isSortable: true, isFilterable: true, isVisible: true },
            { displayName: 'Value', name: 'value', formatter: 'raw', isSortable: true, isFilterable: true, isVisible: true }
          ].concat(defaultColumns);
          break;
        }
        case 'blacklisted-emails':
        {
          $scope.list.display.create = true;
          $scope.list.columns = [
            { displayName: 'Id', name: 'id', formatter: 'raw', isSortable: true, isFilterable: false, isVisible: false },
            { displayName: 'Email', name: 'email', formatter: 'raw', isSortable: true, isFilterable: true, isVisible: true },
          ].concat(defaultColumns);
          break;
        }
      }

      if ($state.params.filters) {
        _.forOwn($state.params.filters, function(filter, name) {
          var col = _.findWhere($scope.list.columns, { name: name });
          if (col) {
            col.filter = filter;
          }
        });
      }

      $scope.$watch('list.columns', function(newValue, oldValue) {
        var filters = {};
        var sort = {};

        _.each($scope.list.columns, function(col) {
          if (_.isString(col.filter) && col.filter.length > 0) {
            filters[col.name] = col.filter;
          }
        });

        if (_.isEqual($scope.request.filters, filters)) {
          return;
        }

        // if (!_.isEqual($scope.request.sort, sort)) {
        //   request.sort = sort;
        // }

        $scope.list.pagination.currentPage = 1;
        $scope.request.filters = filters;
        $scope.getPage();
      }, true);
    };

    $scope.finalizeColumnSelection = function() {
      $ngBootbox.hideAll();
    };

    $scope.createItem = function() {
      var name = $data.models[$scope.meta.route].name;
      $scope.editable[name] = {};
      var tmpl = '/templates/' + $scope.meta.route + '/create-modal.html';
      $ngBootbox.dialog($scope.meta.route, null, null,  tmpl, $scope);
    };

    $scope.finalizeCreateItem = function() {
      var name = $data.models[$scope.meta.route].name;
      if ($scope.editable[name].isAdmin) {
        var adminRole = _.findWhere($data.data.roles, { name:'admin' });
        $scope.editable[name].roles = [ adminRole.id ];
      }

      $data.create($scope.meta.route, $scope.editable[name], function() {
        $ngBootbox.hideAll();
        $notification.success(name + ' successfully created.');
        delete $scope.editable[name];
      });
    };

    $scope.editItem = function(item) {
      var name = $data.models[$scope.meta.route].name;
      if (item.roles) {
        var adminRole = _.findWhere($data.data.roles, { name: 'admin' });
        if (_.contains(item.roles, adminRole.id)) {
          item.isAdmin = true;
        }
      }
      $scope.editable[name] = angular.copy(item);
      var tmpl = '/templates/' + $scope.meta.route + '/edit-modal.html';
      $ngBootbox.dialog($scope.meta.route, null, null,  tmpl, $scope);
    };

    $scope.finalizeEditRow = function() {
      var name = $data.models[$scope.meta.route].name;
      $data.save($scope.meta.route, $scope.editable[name], function(err) {
        if (err) {
          $notification.error(err);
        } else {
          $ngBootbox.hideAll();
          $notification.success(name + ' successfully updated.');
          delete $scope.editable[name];
        }
      });
    };

    $scope.init();
  }
]);
