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
    waivecarOccupied: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    notes: {
      type: Sequelize.TEXT,
      defaultValue: null,
    },
  };

  return model;
});
