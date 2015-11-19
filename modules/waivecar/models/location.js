'use strict';

Bento.Register.Model('Location', 'sequelize', function(model, Sequelize) {

  /**
   * The identity of the table created in your database.
   * @property table
   * @type     String
   */
  model.table = 'locations';

  /**
   * The sequelize schema definition of your model.
   * @property schema
   * @type     Object
   */
  model.schema = {
    type : {
      type         : Sequelize.ENUM('station', 'valet', 'homebase', 'item-of-interest'),
      defaultValue : 'station'
    },
    name        : { type : Sequelize.STRING, allowNull : false },
    description : { type : Sequelize.STRING },
    latitude    : { type : Sequelize.DECIMAL(10, 8), allowNull : false },
    longitude   : { type : Sequelize.DECIMAL(11, 8), allowNull : false },
    address     : { type : Sequelize.STRING },
    status      : {
      type : Sequelize.ENUM(
        'available',
        'unavailable',
        'unknown'
      ),
      defaultValue : 'available'
    }
  };

  return model;

});
