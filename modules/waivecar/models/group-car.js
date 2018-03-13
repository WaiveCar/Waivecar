'use strict';

Bento.Register.Model('GroupCar', 'sequelize', function(model, Sequelize) {
  model.table = 'group_cars';
  
  model.schema = {
    
    groupRoleId : {
      type       : Sequelize.INTEGER,
      allowNull  : false,
      references : {
        model : 'group_roles',
        key   : 'id'
      }
    },
    
    carId : {
      type       : Sequelize.STRING(28),
      allowNull  : false,
      references : {
        model : 'cars',
        key   : 'id'
      }
    }
    
  };
  
  model.relations = [
    'GroupRole',
    'Car',
    function relations(GroupRole, Car) {
      this.belongsTo(GroupRole, { as : 'group_roles', foreignKey : 'groupRoleId' });
      this.belongsTo(Car,       { as : 'car',        foreignKey : 'carId'       });
    }
  ];
  
  return model;
});
