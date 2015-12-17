'use strict';

Bento.Register.Model('GroupRole', 'sequelize', (model, Sequelize) => {

  /**
   * The identity of the table created in your database.
   * @property table
   * @type     String
   */
  model.table = 'group_roles';

  /**
   * The sequelize schema definition of your model.
   * @property schema
   * @type     Object
   */
  model.schema = {

    // ### Required Fields
    // These fields are locked and should not be removed or have its key changed.

    /**
     * The group id the role belongs to.
     * @type {Integer}
     */
    groupId : {
      type       : Sequelize.INTEGER,
      allowNull  : false,
      references : {
        model : 'groups',
        key   : 'id'
      }
    },

    /**
     * The role id for the user within the group.
     * @type {Integer}
     */
    roleId : {
      type       : Sequelize.INTEGER,
      allowNull  : false,
      references : {
        model : 'roles',
        key   : 'id'
      }
    },

    /**
     * Name of the role.
     * @type {String}
     */
    name : {
      type      : Sequelize.STRING,
      allowNull : false
    }

  };

  return model;

});
