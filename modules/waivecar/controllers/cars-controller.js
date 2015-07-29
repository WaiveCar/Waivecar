'use strict';

let Car            = Reach.model('Car');
let CarLocation    = Reach.model('CarLocation');
let CarDiagnostics = Reach.model('CarDiagnostics');

module.exports = Reach.resource(function (_super) {

  Reach.extends(CarsController, _super);

  /**
   * @class CarsController
   */
  function CarsController() {
    _super.call(this, 'Car');
  }

  /**
   * @method index
   * @param  {Object} options
   */
  CarsController.prototype.index = function *(options) {
    let cars = yield Car.find(options);
    if (cars) {
      yield cars.hasOne(CarLocation, 'carId', 'location', ['longitude', 'latitude']);
    }
    return cars;
  };

  return CarsController;

});