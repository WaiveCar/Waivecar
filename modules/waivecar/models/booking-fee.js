'use strict';

Bento.Register.Model('BookingFee', 'sequelize', function (model, Sequelize) {

  /**
   * The identity of the table created in your database.
   * @property table
   * @type     String
   */
  model.table = 'booking_fees';

  /**
   * The sequelize schema definition of your model.
   * @property schema
   * @type     Object
   */
  model.schema = {

    // ### Charge Code
    // A upper cased charge code used when identifying charges
    // in the system.

    code : {
      type       : Sequelize.STRING,
      primaryKey : true
    },

    // ### Title
    // A human readable title for the charge, mostly used by
    // front end services to display to the client.

    title : {
      type : Sequelize.STRING
    },

    // ### Description
    // A human readable fee description, mostly used by
    // front end services to display to the client.

    description : {
      type : Sequelize.TEXT
    },

    // ### Amount
    // The amount in cents that is being charged.

    amount : {
      type : Sequelize.INTEGER
    }

  };

  return model;

});