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
      include : [
        {
          model : 'CarLocation',
          as    : 'location',
          attr  : [ 'latitude', 'longitude' ]
        },
        {
          model : 'CarStatus',
          as    : 'booking',
          attr  : [ 'status' ]
        }
      ]
    }));
  };

  /**
   * @method show
   * @param  {String} id
   * @param  {Object} options
   * @return {Car}
   */
  controller.show = function *(id, options) {
    return yield Car.findById(id, {
      include : [
        {
          model : 'CarLocation',
          as    : 'location',
          attr  : [ 'latitude', 'longitude' ]
        },
        {
          model : 'CarStatus',
          as    : 'booking',
          attr  : [ 'status' ]
        },
        {
          model : 'CarDiagnostic',
          as    : 'diagnostics'
        }
      ]
    });
  };

  return controller;

});
