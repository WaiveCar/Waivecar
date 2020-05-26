'use strict';

Bento.Register.Model('Shop/Card', 'sequelize', (model, Sequelize) => {
  model.table = 'shop_payment_cards';

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
      allowNull  : true,
      references : {
        model : 'users',
        key   : 'id'
      }
    },

    organizationId : {
      type       : Sequelize.INTEGER,
      allowNull  : true,
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
    },

    type : {
      type : Sequelize.STRING(8)
    },

    name : {
      type : Sequelize.STRING(96)
    }
  };

  model.attributes = [
    'user',
    'selected',
  ];

  model.relations = [
    'User',
    'Organization',
    function(User, Booking, Organization) {
      this.belongsTo(User, { as : 'user', foreignKey : 'userId' });
      this.belongsTo(User, { as : 'organization', foreignKey : 'organizationId' });
    }
  ];

  return model;

});
