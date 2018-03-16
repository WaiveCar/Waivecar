'use strict';

Bento.Register.Model('GroupUser', 'sequelize', (model, Sequelize) => {

  model.table = 'group_users';

  /**
   * The sequelize schema definition of your model.
   * @property schema
   * @type     Object
   */
  model.schema = {

    // ### Required Fields
    // These fields are locked and should not be removed or have its key changed.

    /**
     * The group id the user belongs to.
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
     * The user id belonging to the group.
     * @type {Integer}
     */
    userId : {
      type       : Sequelize.INTEGER,
      allowNull  : false,
      references : {
        model : 'users',
        key   : 'id'
      }
    },

    /**
     * The custom role name for the user within the group.
     * @type {Integer}
     */
    groupRoleId : {
      type       : Sequelize.INTEGER,
      references : {
        model : 'group_roles',
        key   : 'id'
      }
    }

  };

  model.attributes = ['group'];
  
  model.relations = [
    'Group',
    function relations(Group) {
      this.belongsTo(Group, { as: 'group' });
    }
  ];

  return model;

});
