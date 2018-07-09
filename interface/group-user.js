'use strict';

Bento.Register.Model('GroupUser', 'sequelize', (model, Sequelize) => {

  model.table = 'group_users';

  model.schema = {

    // ### Required Fields
    // These fields are locked and should not be removed or have its key changed.

    groupId : {
      type       : Sequelize.INTEGER,
      allowNull  : false,
      references : {
        model : 'groups',
        key   : 'id'
      }
    },

    userId : {
      type       : Sequelize.INTEGER,
      allowNull  : false,
      references : {
        model : 'users',
        key   : 'id'
      }
    },

    groupRoleId : {
      type       : Sequelize.INTEGER,
      references : {
        model : 'group_roles',
        key   : 'id'
      }
    }

  };

  model.attributes = ['group', 'group_role'];
  
  model.relations = [
    'Group',
    'GroupRole',
    function relations(Group, GroupRole) {
      this.belongsTo(Group, { as: 'group' });
      this.belongsTo(GroupRole, { as: 'group_role' });
    }
  ];

  return model;

});
