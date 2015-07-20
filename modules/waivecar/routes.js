'use strict';

var Router = Reach.Router;

Router.resource('cars', 'CarsController', {
  params : [ ] // no fields currently stored are updatable via resource.
});
