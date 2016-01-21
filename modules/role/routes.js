'use strict';

Route.get('/roles',                             'Role/RolesController@index');
Route.get('/roles/:group', [ 'isAuthenticated', 'Role/RolesController@groupIndex' ]);
