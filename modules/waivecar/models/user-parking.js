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
    parkingDetailId: {
      type: Sequelize.INTEGER,
      defaultValue: null,
      references: {
        model: 'parking_details',
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
    function(Location, ParkingReservation, ParkingDetails) {
      this.belongsTo(Location, {as: 'location', foreignKey: 'locationId'});
      this.belongsTo(ParkingReservation, {
        as: 'reservation',
        foreignKey: 'reservationId',
      });
      this.belongsTo(ParkingDetails, {
        as: 'parkingDetails',
        foreignKey: 'parkingDetailId',
      });
    },
  ];

  return model;
});
