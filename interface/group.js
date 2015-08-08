'use strict';

Reach.Register.Model('Group', 'sequelize', function (model, Sequelize) {
  
  /**
   * The identity of the table created in your database.
   * @property table
   * @type     String
   */
  model.table = 'groups';

  /**
   * The sequelize schema definition of your model.
   * @property schema
   * @type     Object
   */
  model.schema = {
    creatorId : { 
      type       : Sequelize.INTEGER, 
      allowNull  : false,
      references : {
        model : 'users',
        key   : 'id'
      }
    },
    name : { type : Sequelize.STRING(88), allowNull : false }
  };

  /**
   * Attributes to remove before returning the model as JSON.
   * @property blacklist
   * @type     Array
   */
  model.blacklist = [ 'deletedAt' ];

  return model;

});