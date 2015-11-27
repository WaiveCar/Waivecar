'use strict';

Bento.Register.Model('License', 'sequelize', function(model, Sequelize) {

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

    gender : {
      type : Sequelize.ENUM(
        'male',
        'female'
      ),
      defaultValue : 'male'
    },

    state : {
      type      : Sequelize.STRING(20),
      allowNull : false
    },

    zip : {
      type      : Sequelize.STRING(80),
      allowNull : true
    },

    linkedUserId : {
      type      : Sequelize.STRING(64),
      allowNull : true
    },

    checkId : {
      type      : Sequelize.STRING(64),
      allowNull : true
    },

    reportId : {
      type      : Sequelize.STRING(64),
      allowNull : true
    },

    status : {
      type         : Sequelize.STRING(64),
      allowNull    : false,
      defaultValue : 'provided'
    },

    outcome : {
      type      : Sequelize.STRING(64),
      allowNull : true
    },

    verifiedAt : {
      type      : Sequelize.DATE(),
      allowNull : true
    }

  };

  /**
   * Attributes to remove before returning the model as JSON.
   * @property blacklist
   * @type     Array
   */
  model.blacklist = [ 'linkedUserId', 'checkId', 'reportId', 'deletedAt' ];

  return model;

});
