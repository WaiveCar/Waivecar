'use strict';

Bento.Register.Model('Shop/Cart', 'sequelize', (model, Sequelize) => {

  /**
   * The identity of the table created in your database.
   * @property table
   * @type     String
   */
  model.table = 'shop_carts';

  /**
   * The sequelize schema definition of your model.
   * @property schema
   * @type     Object
   */
  model.schema = {

    /**
     * The id of the cart being referenced.
     * @type {String}
     */
    cartId : {
      type       : Sequelize.STRING,
      primaryKey : true
    },

    /**
     * The id of the user the cart is assigned to.
     * @type {Number}
     */
    userId : {
      type       : Sequelize.INTEGER,
      allowNull  : false,
      references : {
        model : 'users',
        key   : 'id'
      }
    }

  };

  return model;

});
