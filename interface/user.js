'use strict';

Reach.Register.Model('User', 'sequelize', function (model, Sequelize) {

  /**
   * The identity of the table created in your database.
   * @property table
   * @type     String
   */
  model.table = 'users';

  /**
   * The sequelize schema definition of your model.
   * @property schema
   * @type     Object
   */
  model.schema = {
    role      : { type : Sequelize.ENUM('user', 'admin'), defaultValue : 'user' },
    firstName : { type : Sequelize.STRING(28), allowNull : false },
    lastName  : { type : Sequelize.STRING(28), allowNull : false },
    email     : { type : Sequelize.STRING(128), unique : true },
    password  : { type : Sequelize.STRING(64) },
    facebook  : { type : Sequelize.STRING(64) },
    twitter   : { type : Sequelize.STRING(64) },
    linkedin  : { type : Sequelize.STRING(64) },
    stripeId  : { type : Sequelize.STRING(64) },
    status    : { type : Sequelize.ENUM('active', 'suspended'), defaultValue : 'active' }
  };

  /**
   * The relation definitions of your model.
   * @property relations
   * @type     Array
   */
  model.relations = ['Group', function (Group) {
    this.belongsToMany(Group, { as : 'groups', through : 'user_groups', foreignKey : 'userId' })
  }];

  /**
   * Attributes to remove before returning the model as JSON.
   * @property blacklist
   * @type     Array
   */
  model.blacklist = [ 'password', 'deletedAt' ];

  /**
   * A list of model methods.
   * @property methods
   * @type     Object
   */
  model.methods = {
    name: function () {
      return this.firstName + ' ' + this.lastName;
    }
  };

  return model;

});