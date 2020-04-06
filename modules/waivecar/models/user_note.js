'use strict';

Bento.Register.Model('UserNote', 'sequelize', function(model, Sequelize) {
  /**
   * The identity of the table created in your database.
   * @property table
   * @type     String
   */
  model.table = 'user_notes';

  /**
   * The sequelize schema definition of your model.
   * @property schema
   * @type     Object
   */
  model.schema = {

    userId : {
      type       : Sequelize.INTEGER,
      allowNull  : false,
      references : {
        model : 'users',
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
    },

    type : {
      type      : Sequelize.TEXT,
      allowNull : true
    }

  };

  model.attributes = [
    'user',
    'author'
  ];

  model.relations = [
    'User',
    function(User, Car) {
      this.belongsTo(User, { as : 'author', foreignKey : 'authorId' });
      this.belongsTo(User, { as : 'user', foreignKey : 'userId' });
    }
  ];

  return model;

});
