'use strict';

Bento.Register.Model('WaiveworkPayment', 'sequelize', function(
  model,
  Sequelize,
) {
  model.table = 'waivework_payments';

  model.schema = {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
    },

    bookingId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'bookings',
        key: 'id',
      },
    },

    bookingPaymentId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      default: null,
      references: {
        model: 'booking_payments',
        key: 'id',
      },
    },

    date: {
      type: Sequelize.DATE,
      allowNull: true,
      default: null,
    },

    amount: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  };

  model.relations = [
    'Booking',
    'BookingPayment',
    function relations(Booking, BookingPayment) {
      this.belongsTo(Booking, {as: 'booking', foreignKey: 'bookingId'});
      this.belongsTo(BookingPayment, {
        as: 'bookingPayment',
        foreignKey: 'bookingPayementId',
      });
    },
  ];

  return model;
});
