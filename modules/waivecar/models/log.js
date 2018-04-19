'use strict';

Bento.Register.Model('Log', 'sequelize', function(model, Sequelize) {
  model.table = 'logs';

  model.sequelizeOptionMap = {
    updatedAt: false,
    deletedAt: false,
    paranoid: false
  };

  model.schema = {

    bookingId : {
      type       : Sequelize.INTEGER,
      references : {
        model : 'bookings',
        key   : 'id'
      }
    },

    carId : {
      type       : Sequelize.STRING(28),
      references : {
        model : 'cars',
        key   : 'id'
      }
    },

    userId : {
      type       : Sequelize.INTEGER,
      references : {
        model : 'users',
        key   : 'id'
      }
    },

    actorId : {
      type       : Sequelize.INTEGER,
      allowNull  : false,
      references : {
        model : 'users',
        key   : 'id'
      }
    },

    action : {
      type      : Sequelize.STRING(250),
      allowNull : false
    }
  };

  model.attributes = [
    'booking',
    'actor',
    'car',
    'user'
  ];

  model.relations = [
    'User',
    'Booking',
    'Car',
    function(User, Booking, Car) {
      this.belongsTo(User, { as : 'actor', foreignKey : 'actorId' });
      this.belongsTo(User, { as : 'user', foreignKey : 'userId' });
      this.belongsTo(Booking, { as : 'booking', foreignKey : 'bookingId' });
      this.belongsTo(Car, { as : 'car', foreignKey : 'carId' });
    }
  ];

  return model;

});
