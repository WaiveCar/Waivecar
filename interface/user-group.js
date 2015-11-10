'use strict';

Bento.Register.Model('UserGroup', 'sequelize', function (model, Sequelize) {

  /**
   * The identity of the table created in your database.
   * @property table
   * @type     String
   */
  model.table = 'user_groups';

  /**
   * The sequelize schema definition of your model.
   * @property schema
   * @type     Object
   */
  model.schema = {
    userId : {
      type       : Sequelize.INTEGER,
      primaryKey : true,
      allowNull  : false,
      references : {
        model : 'users',
        key   : 'id'
      }
    },
    groupId : {
      type       : Sequelize.INTEGER,
      primaryKey : true,
      allowNull  : false,
      references : {
        model : 'groups',
        key   : 'id'
      }
    }
  };

  /**
   * Attributes to remove before returning the model as JSON.
   * @property blacklist
   * @type     Array
   */
  model.blacklist = [ 'deletedAt' ];

  return model;

});
