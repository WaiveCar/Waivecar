'use strict';

// ### File Routes

Route.get('/file/:id', 'FilesController@show');

// ### Model Routes

Route.pst('/files',     [ 'isAuthenticated', 'FilesController@store' ]);
Route.get('/files',                          'FilesController@index');
Route.get('/files/:id',                      'FilesController@meta');
Route.del('/files/:id', [ 'isAuthenticated', 'FilesController@delete' ]);
