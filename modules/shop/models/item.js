'use strict';

Bento.Register.Model('Shop/Item', 'sequelize', (model, Sequelize) => {

  /**
   * The identity of the table created in your database.
   * @property table
   * @type     String
   */
  model.table = 'shop_items';

  /**
   * The sequelize schema definition of your model.
   * @property schema
   * @type     Object
   */
  model.schema = {

    /**
     * The shop category the item belongs to.
     * @type {Integer}
     */
    categoryId : {
      type       : Sequelize.INTEGER,
      allowNull  : false,
      references : {
        model : 'shop_categories',
        key   : 'id'
      }
    },

    /**
     * The product number for the item.
     * @type {String}
     */
    productNo : {
      type : Sequelize.STRING
    },

    /**
     * The item name.
     * @type {String}
     */
    name : {
      type      : Sequelize.STRING,
      allowNull : false
    },

    /**
     * The item description.
     * @type {Text}
     */
    description : {
      type : Sequelize.TEXT
    },

    /**
     * The item price.
     * @type {Integer}
     */
    price : {
      type      : Sequelize.INTEGER,
      allowNull : false
    }

  };

  return model;

});
