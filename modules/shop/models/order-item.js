'use strict';

Bento.Register.Model('Shop/OrderItem', 'sequelize', (model, Sequelize) => {

  /**
   * The identity of the table created in your database.
   * @property table
   * @type     String
   */
  model.table = 'shop_order_items';

  /**
   * The sequelize schema definition of your model.
   * @property schema
   * @type     Object
   */
  model.schema = {

    /**
     * The order id the item belongs to.
     * @type {Integer}
     */
    orderId : {
      type       : Sequelize.INTEGER,
      allowNull  : false,
      references : {
        model : 'shop_orders',
        key   : 'id'
      }
    },

    /**
     * The id refering to the item, by default we do not reference this
     * when listing an order. It serves as a reference to the live item
     * and not the items state at the time of a placed order.
     * @type {Integer}
     */
    itemId : {
      type       : Sequelize.INTEGER,
      allowNull  : false,
      references : {
        model : 'shop_items',
        key   : 'id'
      }
    },

    /**
     * The item product number at the time of purchase.
     * @type {String}
     */
    productNo : {
      type : Sequelize.STRING
    },

    /**
     * The item name at the time of purchase.
     * @type {String}
     */
    name : {
      type      : Sequelize.STRING,
      allowNull : false
    },

    /**
     * The item description at the time of purchase.
     * @type {Text}
     */
    description : {
      type : Sequelize.TEXT
    },

    /**
     * The item price at the time of purchase.
     * @type {Integer}
     */
    price : {
      type      : Sequelize.INTEGER,
      allowNull : false
    },

    /**
     * The item quantity at the time of purchase.
     * @type {Integer}
     */
    quantity : {
      type      : Sequelize.INTEGER,
      allowNull : false,
    }

  };

  return model;

});
