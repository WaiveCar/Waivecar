'use strict';

Bento.Register.Model('BookingNote', 'sequelize', function(model, Sequelize) {
  /**
   * The identity of the table created in your database.
   * @property table
   * @type     String
   */
  model.table = 'booking_notes';

  /**
   * The sequelize schema definition of your model.
   * @property schema
   * @type     Object
   */
  model.schema = {

    bookingId : {
      type       : Sequelize.INTEGER,
      allowNull  : false,
      references : {
        model : 'bookings',
        key   : 'id'
      }
    },

    authorId : {
      type       : Sequelize.INTEGER,
      allowNull  : false,
      references : {
        model : 'users',
        key   : 'id'
      }
    },

    organizationId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    },

    content : {
      type      : Sequelize.STRING(250),
      allowNull : false
    }
  };

  model.attributes = [
    'booking',
    'author'
  ];

  model.relations = [
    'User',
    'Booking',
    function(User, Booking) {
      this.belongsTo(User, { as : 'author', foreignKey : 'authorId' });
      this.belongsTo(Booking, { as : 'booking', foreignKey : 'bookingId' });
    }
  ];

  return model;

});
