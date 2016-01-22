'use strict';

Bento.Register.Model('EventLog', 'sequelize', (model, Sequelize) => {

  /**
   * The identity of the table created in your database.
   * @property table
   * @type     String
   */
  model.table = 'log_events';

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

    // ### User
    // The user that the event connects to, NULL value means the
    // log was performed by the system.

    userId : {
      type       : Sequelize.INTEGER,
      references : {
        model : 'users',
        key   : 'id'
      }
    },

    // ### Type
    // The category type of the event, used for easier filtering.

    type : {
      type      : Sequelize.STRING,
      allowNull : false
    },

    // ### Value
    // Represents the event text value that we are logging.

    value : {
      type      : Sequelize.TEXT,
      allowNull : false
    },

    // ### Comment

    comment : {
      type : Sequelize.TEXT
    },

    // ### Resolved
    // Holds event resolved state, default is true as events are usually not needed
    // to be reviewed. In case it is needed we set this to false so it can be
    // filtered for review.

    resolved : {
      type         : Sequelize.BOOLEAN,
      defaultValue : true
    }

  };

  return model;

});

