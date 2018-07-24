'use strict';

Bento.Register.Model('ParkingReservation', 'sequelize', function register(
  model,
  Sequelize,
) {
  model.table = 'parking_reservations';
 
  model.schema = {
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'user',
        key: 'id',
      },
    },
    spaceId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'user_parking',
        key: 'id',
      },
    },
    createdAt: {
      type: Sequelize.DATE,
    },
  };
  
  return model;
});
