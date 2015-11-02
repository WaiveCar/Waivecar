'use strict';

let queryParser = Bento.provider('sequelize/helpers').query;
let Car         = Bento.model('Car');

Bento.Register.ResourceController('Car', 'CarsController', function (controller) {

  /**
   * @method index
   * @return {Array}
   */
  controller.index = function *() {
    return yield Car.find(queryParser(this.query, {
      include : [
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
          model : 'CarDiagnostic',
          as    : 'diagnostics',
          attr  : [ 'type', 'status', 'value', 'unit' ]
        }
      ]
    });
  };

  return controller;

});
