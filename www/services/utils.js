function Utils(Config) {
  this.config = Config;
}

function transformPaginatedResponse(data) {
  if (data.data) return data.data;
  return data;
}

Utils.prototype.getRoute = function(primaryRoute, hasId) {
  var fragments = [ this.config.uri.api, primaryRoute ];
  if (hasId) fragments.push(':id');
  return fragments.join('/');
}

Utils.prototype.getCustomRoute = function(endpoint) {
  var fragments = [ this.config.uri.api, endpoint ];
  return fragments.join('/');
}

Utils.prototype.transformArrayResponse = function (data, headersGetter, status) {
  data = angular.fromJson(data);
  var models = [];
  if (200 === status) {
    return transformPaginatedResponse(data);
  }
  return data;
}

Utils.prototype.createResource = function(resourceName, additionalMethods) {
  additionalMethods = additionalMethods || {};

  var resource = {
    save   : {
      method : 'POST',
      url    : this.getRoute(resourceName)
    },
    query  : {
      method            : 'GET',
      url               : this.getRoute(resourceName),
      isArray           : true,
      transformResponse : this.transformArrayResponse
    },
    get    : {
      method : 'GET',
      url    : this.getRoute(resourceName, true)
    },
    update : {
      method : 'PUT',
      url    : this.getRoute(resourceName, true),
      params : {
        id : '@id'
      }
    },
    remove : {
      method : 'DELETE',
      url    : this.getRoute(resourceName, true),
      params : {
        id : '@id'
      }
    }
  };

  return angular.extend(additionalMethods, resource);
}

angular.module('app')
.service('$utils', [
  '$config',
  Utils
]);
