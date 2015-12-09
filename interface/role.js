'use strict';

Bento.Register.Model('Role', 'sequelize', (model, Sequelize) => {

  /**
   * The identity of the table created in your database.
   * @property table
   * @type     String
   */
  model.table = 'roles';

  /**
   * The sequelize schema definition of your model.
   * @property schema
   * @type     Object
   */
  model.schema = {

    // ### Required Fields
    // These fields are locked and should not be removed or have its key changed.

    // ### Name
    // The name of the role.

    name : {
      type      : Sequelize.STRING,
      allowNull : false
    },

    // ### Position
    // The credential position of the role, 0 being the lowest access.

    position : {
      type         : Sequelize.INTEGER,
      allowNull    : false,
      defaultValue : 0
    }

  };

  return model;

});
