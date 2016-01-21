'use strict';

Bento.Register.Model('ErrorLog', 'sequelize', (model, Sequelize) => {

  /**
   * The identity of the table created in your database.
   * @property table
   * @type     String
   */
  model.table = 'log_errors';

  /**
   * The sequelize schema definition of your model.
   * @property schema
   * @type     Object
   */
  model.schema = {

    origin : {
      type         : Sequelize.STRING,
      defaultValue : 'API'
    },

    // ### General
    // The general error parameters.

    code : {
      type      : Sequelize.STRING,
      allowNull : false
    },

    message : {
      type      : Sequelize.TEXT,
      allowNull : false
    },

    solution : {
      type : Sequelize.TEXT
    },

    data : {
      type : Sequelize.TEXT
    },

    // ### Route
    // Holds route information that was accessed when the error occured.

    route : {
      type : Sequelize.STRING
    },

    uri : {
      type : Sequelize.STRING
    },

    // ### Stack

    stack : {
      type : Sequelize.TEXT
    },

    // ### Comment

    comment : {
      type : Sequelize.TEXT
    },

    // ### Count
    // How many instances of this error has been spawned, can be timed
    // by using created_at and updated_at fields.

    count : {
      type         : Sequelize.INTEGER,
      defaultValue : 1
    },

    // ### Resolved
    // Holds the resolved state, we store this state for easier
    // management of unresolved error events.

    resolved : {
      type         : Sequelize.BOOLEAN,
      defaultValue : false
    }

  };

  return model;

});

