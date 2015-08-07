'use strict';

Reach.Register.Model('CarLocation', 'sequelize', function (model, Sequelize) {
  
  /**
   * The identity of the table created in your database.
   * @property table
   * @type     String
   */
  model.table = 'car_locations';

  /**
   * The sequelize schema definition of your model.
   * @property schema
   * @type     Object
   */
  model.schema = {
    carId : {
      type       : Sequelize.STRING(28),
      primaryKey : true,
      references : {
        model : 'cars',
        key   : 'id'
      }
    },
    latitude  : { type : Sequelize.DECIMAL(10, 8), allowNull : false },
    longitude : { type : Sequelize.DECIMAL(11, 8), allowNull : false }
  };

  return model;

});