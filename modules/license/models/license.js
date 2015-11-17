'use strict';

Bento.Register.Model('License', 'sequelize', function (model, Sequelize) {

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
    userId : {
      type       : Sequelize.INTEGER,
      allowNull  : false,
      references : {
        model : 'users',
        key   : 'id'
      }
    },

    fileId : {
      type : Sequelize.STRING
    },

    number : {
      type      : Sequelize.STRING(80),
      allowNull : false
    },

    firstName : {
      type      : Sequelize.STRING(80),
      allowNull : false
    },

    middleName : {
      type      : Sequelize.STRING(80),
      allowNull : true
    },

    lastName : {
      type      : Sequelize.STRING(80),
      allowNull : false
    },

    birthDate : {
      type      : Sequelize.DATEONLY(),
      allowNull : false
    },

    state : {
      type      : Sequelize.STRING(20),
      allowNull : false
    },

    zip : {
      type      : Sequelize.STRING(80),
      allowNull : false
    },

    ssn : {
      type      : Sequelize.STRING(80),
      allowNull : false
    },

    candidateId : {
      type      : Sequelize.STRING(64),
      allowNull : true
    },

    reportId : {
      type      : Sequelize.STRING(64),
      allowNull : true
    },

    status : {
      type : Sequelize.ENUM(
        'provided',
        'pending',
        'clear',
        'consider',
        'suspended',
        'dispute',
        'failed'
      ),
      defaultValue : 'provided'
    }

  };

  /**
   * Attributes to remove before returning the model as JSON.
   * @property blacklist
   * @type     Array
   */
  model.blacklist = [ 'candidateId', 'reportId', 'ssn', 'deletedAt' ];

  return model;

});
