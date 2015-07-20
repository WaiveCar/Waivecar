'use strict';

let flux   = Reach.IO.flux;
let Car   = Reach.model('Car');

module.exports = Reach.resource(function (_super) {

  Reach.extends(CarsController, _super);

  /**
   * @class CarsController
   */
  function CarsController() {
    _super.call(this, 'Car');
  }

 return CarsController;

});