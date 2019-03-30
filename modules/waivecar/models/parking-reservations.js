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
    expired: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    bookingId: {
      type: Sequelize.INTEGER,
      defaultValue: null,
    },
    createdAt: {
      type: Sequelize.DATE,
    },
  };

  model.relations = [
    'User',
    function(User) {
      this.belongsTo(User, {as: 'user', foreignKey: 'userId'});
    },
  ];

  return model;
});
