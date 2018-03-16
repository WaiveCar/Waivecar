'use strict';

Bento.Register.Model('Group', 'sequelize', (model, Sequelize) => {

  /**
   * The identity of the table created in your database.
   * @property table
   * @type     String
   */
  model.table = 'groups';

  /**
   * The sequelize schema definition of your model.
   * @property schema
   * @type     Object
   */
  model.schema = {

    // ### Required Fields
    // These fields are locked and should not be removed or have its key changed.

    /**
     * THe name of the group.
     * @type {String}
     */
    name : {
      type      : Sequelize.STRING,
      allowNull : false
    }

    // ### Optional Fields
    // Group fields are all optional as all things relates against the group id.

    // Create some group fields...

  };

  model.methods = {

    // ### Required Methods
    // These methods are locked and should not be removed or have its key changed.

    /**
     * Checks if the provided id belongs to this group.
     * @param  {String}  id
     * @return {Boolean}
     */
    hasAccess(id) {
      return this.id === id;
    }

  };

  return model;

});
