'use strict';

Reach.Register.Model('CarDiagnostic', 'sequelize', function (model, Sequelize) {

  /**
   * The identity of the table created in your database.
   * @property table
   * @type     String
   */
  model.table = 'car_diagnostics';

  /**
   * The sequelize schema definition of your model.
   * @property schema
   * @type     Object
   */
  model.schema = {
    carId : {
      type       : Sequelize.STRING(28),
      allowNull  : false,
      references : {
        model : 'cars',
        key   : 'id'
      }
    },

    type : { 
      type : Sequelize.STRING(64), 
      allowNull : false 
    },

    status : { 
      type : Sequelize.STRING(28) 
    },

    message : { 
      type : Sequelize.STRING(28) 
    },

    value : { 
      type : Sequelize.STRING(128) 
    },

    unit : { 
      type : Sequelize.STRING(28) 
    }
  };

  return model;

});