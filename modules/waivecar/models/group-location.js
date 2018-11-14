'use strict';

Bento.Register.Model('GroupLocation', 'sequelize', function(model, Sequelize) {
  model.table = 'group_locations';

  model.sequelizeOptionMap = {
    updatedAt: false,
    deletedAt: false,
    paranoid: false
  };
  
  model.schema = {
    
    groupRoleId : {
      type       : Sequelize.INTEGER,
      allowNull  : false,
      references : {
        model : 'group_roles',
        key   : 'id'
      }
    },
    
    locationId : {
      type       : Sequelize.INTEGER,
      allowNull  : false,
      references : {
        model : 'location',
        key   : 'id'
      }
    }
    
  };
  
  model.relations = [
    'GroupRole',
    'Location',
    function relations(GroupRole, Location) {
      this.belongsTo(GroupRole, { as : 'group_role' });
      this.belongsTo(Location,  { as : 'location'  });
    }
  ];
  
  return model;
});
