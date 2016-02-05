// Route.pst('/files',     ['authenticate', 'FilesController@store']);
// Route.get('/files',                      'FilesController@index');
// Route.get('/files/:id',                  'FilesController@show');
// Route.del('/files/:id', ['authenticate', 'FilesController@delete']);

'use strict';
var angular = require('angular');
require('../services/resource-service');

module.exports = angular.module('app').factory('File', [
  'Resource',
  function(Resource) {


    return Resource('/files/:id', {
      id: '@id'
    });

  }
]);
