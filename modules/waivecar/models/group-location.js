'use strict';

Bento.Register.Model('GroupLocation', 'sequelize', function(model, Sequelize) {
  model.table = 'group_locations';

  model.sequelizeOptionMap = {
    updatedAt: false,
    deletedAt: false,
    paranoid: false
  };
  
  model.schema = {
    groupRoleId : { type : Sequelize.INTEGER },
    locationId : { type : Sequelize.INTEGER }
  };
  
  model.relations = [
    'GroupRole',
    'Location',
    function relations(GroupRole, Location) {
      this.belongsTo(GroupRole, { as: 'groupRole' });
      this.belongsTo(Location, { as : 'location' });
    }
  ];
  
  return model;
});
