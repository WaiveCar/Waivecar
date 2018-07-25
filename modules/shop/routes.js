'use strict';

// ### Service Hooks
// Incoming events from 3rd party payment services.

Route.post('/shop/hooks/:service', 'Shop/HooksController@catch');

// ### Customer Routes
// A series of routes for managing customer data.

Route.post('/shop/customers', {
  policy : 'isAuthenticated',
  uses   : 'Shop/CustomersController@create',
  params : [ 'userId' ]
});

Route.put('/shop/customers/:id', [ 'isAuthenticated', 'Shop/CustomersController@update' ]);
Route.del('/shop/customers/:id', [ 'isAuthenticated', 'Shop/CustomersController@delete' ]);

// ### Card Routes
// A series of routes for creating new payment cards with the assigned
// payment service.

Route.post('/shop/quickcharge', {
  policy : [ 'isAuthenticated' ],
  uses   : 'Shop/OrdersController@quickcharge',
});

Route.post('/shop/topUp', {
  policy : [ 'isAuthenticated' ],
  uses   : 'Shop/OrdersController@topup',
});
// This route is for refunding charges. It requires an amount property in the body of the request.
Route.post('/shop/refund/:id', [ 'isAuthenticated', 'isAdmin', 'Shop/OrdersController@refund' ]);

Route.post('/shop/cards', {
  policy : 'isAuthenticated',
  uses   : 'Shop/CardsController@create',
  params : [ 'userId', 'card' ]
});

Route.get('/shop/cards',     [ 'isAuthenticated', 'Shop/CardsController@index' ]);
Route.get('/shop/cards/:id', [ 'isAuthenticated', 'Shop/CardsController@show' ]);
Route.put('/shop/cards/:id', [ 'isAuthenticated', 'Shop/CardsController@update' ]);
Route.del('/shop/cards/:id', [ 'isAuthenticated', 'Shop/CardsController@delete' ]);

// ### Item Routes
// List of routes for managing shop procucts/items.

Route.post('/shop/items', {
  policy : [ 'isAuthenticated', 'isAdmin' ],
  uses   : 'Shop/ItemsController@create'
});

Route.put('/shop/items/:id', {
  policy : [ 'isAuthenticated', 'isAdmin' ],
  uses   : 'Shop/ItemsController@update'
});

Route.del('/shop/items/:id', {
  policy : [ 'isAuthenticated', 'isAdmin' ],
  uses   : 'Shop/ItemsController@delete'
});

Route.get('/shop/items',     'Shop/ItemsController@index');
Route.get('/shop/items/:id', 'Shop/ItemsController@show');

// ### Cart Routes
// A series of routes for handling carts.

Route.pst('/shop/carts',     'Shop/CartsController@create');
Route.get('/shop/carts',     'Shop/CartsController@index');
Route.get('/shop/carts/:id', 'Shop/CartsController@show');
Route.put('/shop/carts/:id', 'Shop/CartsController@update');

Route.put('/shop/carts/save/:id', {
  policy : 'isAuthenticated',
  uses   : 'Shop/CartsController@save',
  param  : [ 'userId' ]
});

Route.del('/shop/carts/:id', 'Shop/CartsController@delete');

// ### Order Routes
// Places a new order based on provided cart and payment details.

Route.post('/shop/orders', {
  policy : 'isAuthenticated',
  uses   : 'Shop/OrdersController@create',
  params : [ 'userId', 'cart', 'source', 'currency' ]
});

Route.post('/shop/orders/authorize', {
  policy : 'isAuthenticated',
  uses   : 'Shop/OrdersController@authorize',
  params : [ ]
});

Route.post('/shop/orders/capture/:id', {
  policy : 'isAuthenticated',
  uses   : 'Shop/OrdersController@capture',
  params : [ 'cart' ]
});

Route.get('/shop/orders',     [ 'isAuthenticated', 'Shop/OrdersController@index' ]);
Route.get('/shop/orders/:id', [ 'isAuthenticated', 'Shop/OrdersController@show' ]);
