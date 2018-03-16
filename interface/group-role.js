'use strict';

Bento.Register.Model('GroupRole', 'sequelize', (model, Sequelize) => {

  model.table = 'group_roles';

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

    roleId : {
      type       : Sequelize.INTEGER,
      allowNull  : false,
      references : {
        model : 'roles',
        key   : 'id'
      }
    },

    name : {
      type      : Sequelize.STRING,
      allowNull : false
    }

  };

  return model;

});
