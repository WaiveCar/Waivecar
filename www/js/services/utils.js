angular.module('app.services').service('$utils', [
  '$config',
  function ($config) {

    var service = {

      getRoute : function(primaryRoute, hasId) {
        var fragments = [ $config.uri.api, primaryRoute ];
        if (hasId) fragments.push(':id');
        return fragments.join('/');
      },

      getCustomRoute : function(endpoint) {
        var fragments = [ $config.uri.api, endpoint ];
        return fragments.join('/');
      },

      transformPaginatedResponse : function(data) {
        if (data.data) return data.data;
        return data;
      },

      transformArrayResponse : function(data, headersGetter, status) {
        data = angular.fromJson(data);
        var models = [];
        if (200 === status) {
          return service.transformPaginatedResponse(data);
        }
        return data;
      },

      createResource : function(resourceName, additionalMethods) {
        additionalMethods = additionalMethods || {};

        var resource = {
          save   : {
            method : 'POST',
            url    : service.getRoute(resourceName)
          },
          query  : {
            method            : 'GET',
            url               : service.getRoute(resourceName),
            isArray           : true,
            transformResponse : service.transformArrayResponse
          },
          get    : {
            method : 'GET',
            url    : service.getRoute(resourceName, true)
          },
          update : {
            method : 'PUT',
            url    : service.getRoute(resourceName, true),
            params : {
              id : '@id'
            }
          },
          remove : {
            method : 'DELETE',
            url    : service.getRoute(resourceName, true),
            params : {
              id : '@id'
            }
          }
        };

        return angular.extend(additionalMethods, resource);
      }

    };

    return service;

  }
]);
