'use strict';

let query = Reach.service('sequelize/helpers').query;
let Car   = Reach.model('Car');

Reach.Register.ResourceController('Car', 'CarsController', function (controller) {

  /**
   * @method index
   * @param  {Object} options
   * @return {Array}
   */
  controller.index = function *(options) {
    return yield Car.find(query(options, {
      include : [{
        model : 'CarLocation',
        as    : 'location'
      }]
    }));
  };

  return controller;

});