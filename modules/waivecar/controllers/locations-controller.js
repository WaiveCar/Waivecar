'use strict';

module.exports = Reach.resource(function (_super) {

  Reach.extends(LocationsController, _super);

  /**
   * @class LocationsController
   */
  function LocationsController() {
    _super.call(this, 'Location');
  }

 return LocationsController;

});