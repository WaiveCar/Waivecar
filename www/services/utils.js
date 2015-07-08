function Utils(config) {
  this.config = config;
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

angular.module('app')
.service('utils', [
  'config',
  Utils
]);
