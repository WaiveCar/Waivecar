'use strict';

Bento.Register.Model('Shop/Card', 'sequelize', (model, Sequelize) => {

  /**
   * The identity of the table created in your database.
   * @property table
   * @type     String
   */
  model.table = 'shop_payment_cards';

  /**
   * The sequelize schema definition of your model.
   * @property schema
   * @type     Object
   */
  model.schema = {

    // ### Card ID
    // Cards uses the custom card id that is returned from the service its
    // registered under.

    id : {
      type       : Sequelize.STRING(64),
      primaryKey : true
    },

    // ### User ID
    // The user the card belongs to.

    userId : {
      type       : Sequelize.INTEGER,
      allowNull  : false,
      references : {
        model : 'users',
        key   : 'id'
      }
    },

    // ### Public Info
    // The publicly accessible card information.

    last4 : {
      type : Sequelize.STRING(4)
    },

    brand : {
      type : Sequelize.ENUM('Visa', 'American Express', 'MasterCard', 'Discover', 'JCB', 'Diners Club', 'Unknown')
    },

    expMonth : {
      type      : Sequelize.INTEGER,
      allowNull : false
    },

    expYear : {
      type      : Sequelize.INTEGER,
      allowNull : false
    }

  };

  return model;

});

