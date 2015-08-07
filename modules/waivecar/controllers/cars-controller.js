'use strict';

let Car            = Reach.model('Car');
let CarLocation    = Reach.model('CarLocation');
let CarDiagnostics = Reach.model('CarDiagnostics');

Reach.Register.ResourceController('Car', 'CarsController', function (controller) {

  /**
   * @method index
   * @param  {Object} options
   * @return {Array}
   */
  controller.index = function *(options) {
    options.include = [{
      model : CarLocation,
      as    : 'location'
    }]
    return yield Car.find(options);
  };

  return controller;

});