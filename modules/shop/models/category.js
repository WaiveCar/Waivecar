'use strict';

Bento.Register.Model('Shop/Category', 'sequelize', (model, Sequelize) => {

  /**
   * The identity of the table created in your database.
   * @property table
   * @type     String
   */
  model.table = 'shop_categories';

  /**
   * The sequelize schema definition of your model.
   * @property schema
   * @type     Object
   */
  model.schema = {
    name : {
      type : Sequelize.STRING
    }
  };

  return model;

});
