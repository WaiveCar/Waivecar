'use strict';

Reach.Register.Model('Car', 'sequelize', function (model, Sequelize) {
  
  /**
   * The identity of the table created in your database.
   * @property table
   * @type     String
   */
  model.table = 'cars';

  /**
   * The sequelize schema definition of your model.
   * @property schema
   * @type     Object
   */
  model.schema = {
    id                : { type : Sequelize.STRING(28), primaryKey : true },
    make              : { type : Sequelize.STRING(28), allowNull : false },
    year              : { type : Sequelize.STRING(88), allowNull : false },
    manufacturer      : { type : Sequelize.STRING(88), allowNull : false },
    phone             : { type : Sequelize.STRING(28) },
    unitType          : { type : Sequelize.STRING(28) },
    onstarStatus      : { type : Sequelize.STRING(28) },
    primaryDriverId   : { type : Sequelize.STRING(28) },
    primaryDriverUrl  : { type : Sequelize.STRING },
    url               : { type : Sequelize.STRING },
    isInPreActivation : { type : Sequelize.BOOLEAN, defaultValue : false },
  };

  /**
   * The relation definitions of your model.
   * @property relations
   * @type     Array
   */
  model.relations = ['CarLocation', 'CarStatus', function (CarLocation, CarStatus) {
    this.hasOne(CarLocation, { as : 'location', foreignKey : 'carId' });
    this.hasOne(CarStatus,   { as : 'status',   foreignKey : 'carId' });
  }];

  /**
   * Attributes that can be provided that is not part of the model schema.
   * @property attributes
   * @type     Array
   */
  model.attributes = [ 'location', 'status' ];

  return model;

});