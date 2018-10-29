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

    street1 : {
      type : Sequelize.STRING(255),
      allowNull : true
    },

    street2 : {
      type : Sequelize.STRING(255),
      allowNull : true
    },

    city : {
      type : Sequelize.STRING(255),
      allowNull : true
    },

    state : {
      type      : Sequelize.STRING(20),
      allowNull : false
    },

    zip : {
      type : Sequelize.INTEGER,
      allowNull : true
    },

    firstName : {
      type : Sequelize.STRING(80)
    },

    middleName : {
      type : Sequelize.STRING(80)
    },

    lastName : {
      type : Sequelize.STRING(80)
    },

    birthDate : {
      type : Sequelize.DATEONLY()
    },

    expirationDate : {
      type : Sequelize.DATEONLY()
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
      defaultValue : 'pending'
    },

    outcome : {
      type      : Sequelize.STRING(64),
      allowNull : true
    },

    report : {
      type : Sequelize.TEXT
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
  model.blacklist = [ 'linkedUserId', 'checkId', 'reportId', 'report' ];

  // ### Methods
  // A list of methods attached to the model.

  model.methods = {

    /**
     * Returns the validation status of the license.
     * @return {Boolean}
     */
    isValid() {
      return this.outcome === 'clear';
    }

  };

  return model;

});
