'use strict';

Reach.Register.Model('CarStatus', 'sequelize', function (model, Sequelize) {
  
  /**
   * The identity of the table created in your database.
   * @property table
   * @type     String
   */
  model.table = 'car_status';

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
    driverId : {
      type         : Sequelize.INTEGER,
      references   : {
        model : 'users',
        key   : 'id'
      }
    },
    status : { 
      type         : Sequelize.ENUM('available', 'unavailable'), 
      defaultValue : 'available'
    }
  };

  return model;

});