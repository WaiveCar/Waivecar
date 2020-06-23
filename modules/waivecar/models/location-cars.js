let error = Bento.Error;

Bento.Register.Model('LocationCar', 'sequelize', function(model, Sequelize) {
  model.table = 'location_cars'; 

  model.schema = {
    locationId : {
      type       : Sequelize.INTEGER,
      allowNull  : false,
      references : {
        model : 'locations',
        key   : 'id'
      }
    },

    carId : {
      type       : Sequelize.STRING,
      allowNull  : false,
      references : {
        model : 'cars',
        key   : 'id'
      }
    },

    latitude : {
      type      : Sequelize.DECIMAL(10, 8),
      allowNull : false
    },

    longitude : {
      type      : Sequelize.DECIMAL(11, 8),
      allowNull : false
    }
  };

  model.relations = [
    'Location',
    'Car',
    function(Location, Car) {
      this.belongsTo(Location, {foreignKey: 'locationId', as: 'location'});
      this.belongsTo(Car, {foreignKey: 'carId', as: 'car'});
    }
  ];

  return model;
});
