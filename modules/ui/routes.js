'use strict';

let View = Bento.model('View');

// ### Views
// Responsible for handling all dynamic views.

Route.pst('/ui/views',     [ 'isAuthenticated', 'ViewsController@store'   ]);
Route.get('/ui/views',     [ 'isAuthenticated', 'ViewsController@index'   ]);
Route.get('/ui/views/:id', [ 'isAuthenticated', 'ViewsController@show'    ]);
Route.put('/ui/views/:id', [ 'isAuthenticated', 'ViewsController@update'  ]);
Route.del('/ui/views/:id', [ 'isAuthenticated', 'ViewsController@destroy' ]);


// ### UI
// Responsible for fetching resource and field configurations.

Route.get('/ui', 'UiController@index');
