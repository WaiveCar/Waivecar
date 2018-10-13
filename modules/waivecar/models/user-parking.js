'use strict';

Bento.Register.Model('UserParking', 'sequelize', function register(
  model,
  Sequelize,
) {
  model.table = 'user_parking';

  model.schema = {
    locationId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'locations',
        key: 'id',
      },
    },
    ownerId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    ownerOccupied: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
    carId: {
      type: Sequelize.STRING,
      defaultValue: null,
      references: {
        model: 'cars',
        key: 'id',
      },
    },
    waivecarOccupied: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    reservationId: {
      type: Sequelize.INTEGER,
      defaultValue: null,
    },
    notes: {
      type: Sequelize.TEXT,
      defaultValue: null,
    },
  };

  model.relations = [
    'Location',
    'ParkingReservation',
    'ParkingDetails',
    'Car',
    'User',
    function(Location, ParkingReservation, ParkingDetails, Car, User) {
      this.belongsTo(Location, {as: 'location', foreignKey: 'locationId'});
      this.belongsTo(ParkingReservation, {
        as: 'reservation',
        foreignKey: 'reservationId',
      });
      this.belongsTo(Car, {
        as: 'car',
        foreignKey: 'carId',
      });
      this.belongsTo(User, {
        as: 'owner',
        foreignKey: 'ownerId',
      });
    },
  ];

  return model;
});
