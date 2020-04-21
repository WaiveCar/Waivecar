'use strict';

Bento.Register.Model('CarNote', 'sequelize', function(model, Sequelize) {
  /**
   * The identity of the table created in your database.
   * @property table
   * @type     String
   */
  model.table = 'car_notes';

  /**
   * The sequelize schema definition of your model.
   * @property schema
   * @type     Object
   */
  model.schema = {

    carId : {
      type       : Sequelize.STRING(28),
      allowNull  : false,
      references : {
        model : 'cars',
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
    'car',
    'author'
  ];

  model.relations = [
    'User',
    'Car',
    function(User, Car) {
      this.belongsTo(User, { as : 'author', foreignKey : 'authorId' });
      this.belongsTo(Car, { as : 'car', foreignKey : 'carId' });
    }
  ];

  return model;

});
