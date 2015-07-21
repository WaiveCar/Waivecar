'use strict';

var Router = Reach.Router;

Router.resource('cars', 'CarsController', {
  params : [ ] // no fields currently stored are updatable via resource.
});

Router.resource('locations', 'LocationsController', {
  params : [ ] // no fields currently stored are updatable via resource.
});
