'use strict';

Bento.Register.Model('Car', 'sequelize', function (model, Sequelize) {

  /**
   * The identity of the table created in your database.
   * @property table
   * @type     String
   */
  model.table = 'cars';

  /**
   * The sequelize schema definition of your model.
   * @property schema
   * @type     Object
   */
  model.schema = {
    id : { 
      type       : Sequelize.STRING(28), 
      primaryKey : true 
    },

    // ### Car Details

    make : { 
      type      : Sequelize.STRING(28), 
      allowNull : false 
    },

    model : {
      type      : Sequelize.STRING(88),
      allowNull : false
    },

    year : { 
      type      : Sequelize.STRING(4), 
      allowNull : false 
    },

    manufacturer : { 
      type      : Sequelize.STRING(88), 
      allowNull : false 
    },

    // ### Car Location
    // Stores the cars current longitude and latitude coordinates.

    latitude  : { 
      type : Sequelize.DECIMAL(10, 8),
    },

    longitude : { 
      type : Sequelize.DECIMAL(11, 8),
    },

    // ### Car Status
    // This holds information such as the availability of the car
    // and the current user who is occupying the car.

    userId : {
      type       : Sequelize.INTEGER,
      references : {
        model : 'users',
        key   : 'id'
      }
    },

    available : {
      type         : Sequelize.BOOLEAN,
      defaultValue : true
    }

  };

  /**
   * The relation definitions of your model.
   * @property relations
   * @type     Array
   */
  model.relations = [
    'CarDiagnostic',
    function (CarDiagnostic) {
      this.hasMany(CarDiagnostic, { as : 'diagnostics', foreignKey : 'carId' });
    }
  ];

  return model;

});