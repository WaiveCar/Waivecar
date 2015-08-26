'use strict';

Reach.Register.Model('License', 'sequelize', function (model, Sequelize) {

  /**
   * The identity of the table created in your database.
   * @property table
   * @type     String
   */
  model.table = 'licenses';

  /**
   * The sequelize schema definition of your model.
   * @property schema
   * @type     Object
   */
  model.schema = {
    id     : { type : Sequelize.STRING(64), primaryKey : true },
    userId : {
      type       : Sequelize.INTEGER,
      allowNull  : false,
      references : {
        model : 'users',
        key   : 'id'
      }
    },
    number     : { type : Sequelize.STRING(80), allowNull : false },
    firstName  : { type : Sequelize.STRING(80), allowNull : false },
    middleName : { type : Sequelize.STRING(80), allowNull : true },
    lastName   : { type : Sequelize.STRING(80), allowNull : false },
    birthDate  : { type : Sequelize.DATEONLY(), allowNull : false },
    country    : { type : Sequelize.STRING(80), allowNull : false },
    state      : { type : Sequelize.STRING(20), allowNull : false },
    fileId     : { type : Sequelize.STRING }
  };

  return model;

});

