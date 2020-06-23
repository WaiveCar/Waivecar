'use strict';

Bento.Register.Model('Location', 'sequelize', function (model, Sequelize) {
  model.table = 'locations';

  model.schema = {
    type: {
      type: Sequelize.ENUM(
        'station',
        'valet',
        'homebase',
        'item-of-interest',
        'hub',
        'zone',
        'user-parking',
      ),
      defaultValue: 'station',
    },

    organizationId: {
      type: Sequelize.INTEGER,
    },

    name: {
      type: Sequelize.STRING,
    },

    description: {type: Sequelize.STRING},

    isPublic: {type: Sequelize.BOOLEAN, defaultValue: false},

    comments: {type: Sequelize.TEXT()},

    latitude: {type: Sequelize.DECIMAL(10, 8)},

    longitude: {type: Sequelize.DECIMAL(11, 8)},

    address: {type: Sequelize.STRING},

    // I guess these will be in US feet because that's
    // how americans roll. What a silly system.
    radius: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },

    shape: {
      type: Sequelize.STRING,
      allowNull: true,
    },

    restrictions: {
      type: Sequelize.STRING,
      allowNull: true,
    },

    streetType: {
      type: Sequelize.STRING,
      allowNull: true,
    },

    status: {
      type: Sequelize.ENUM('available', 'unavailable', 'unknown'),
      defaultValue: 'available',
    },

    parkingTime: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    },

    minimumCharge: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
  };

  model.tagSystem = {model: 'GroupLocation', key: 'locationId'};

  model.methods = {
    addCar: function* (car) {
      let LocationCar = Bento.model('locationCar');
      let current = yield LocationCar.find({where: {locationId: this.id, carId: car.id}});
      if (!current) {
        let locationCar = new LocationCar({
          locationId: this.id,
          carId: car.id,
        });
        yield locationCar.save();
      } else {
        throw error.parse(
          {
            code: 'CAR_ALREADY_ADDED',
            message: 'This car has already been added to this location',
          },
          400,
        );
      } 
    },
    removeCar: function* (car) {
      let LocationCar = Bento.model('locationCar');
      let current = yield LocationCar.find({where: {locationId: this.id, carId: car.id}});
      if (current) {
        yield current.delete();
      } else {
        throw error.parse(
          {
            code: 'CAR_NOT_ADDED',
            message: 'This car was not assigned to this location',
          },
          400,
        );
      }
    },
  };

  model.relations = [
    'UserParking',
    'GroupLocation',
    'LocationCar',
    function relations(UserParking, GroupLocation, LocationCar) {
      this.hasOne(UserParking, {as: 'parking', foreignKey: 'locationId'});
      this.hasMany(GroupLocation, {as: 'tagList', foreignKey: 'locationId'});
      this.hasMany(LocationCar, {as: 'car', foreignKey: 'locationId'});
    },
  ];

  return model;
});
