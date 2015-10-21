'use strict';

let queryParser = Reach.provider('sequelize/helpers').query;
let Car         = Reach.model('Car');

Reach.Register.ResourceController('Car', 'CarsController', function (controller) {

  /**
   * @method index
   * @return {Array}
   */
  controller.index = function *() {
    return yield Car.find(queryParser(this.query, {
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
          as    : 'diagnostics',
          attr  : [ 'type', 'status', 'value', 'unit' ]
        }
      ]
    }));
  };

  /**
   * @method show
   * @param  {String} id
   * @return {Car}
   */
  controller.show = function *(id) {
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
          as    : 'diagnostics',
          attr  : [ 'type', 'status', 'value', 'unit' ]
        }
      ]
    });
  };

  return controller;

});
