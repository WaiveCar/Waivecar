'use strict';

Bento.Register.Model('CarTag', 'sequelize', function(model, Sequelize) {
  model.table = 'car_tags';
  
  model.schema = {
    
    tagId : {
      type       : Sequelize.INTEGER,
      allowNull  : false,
      references : {
        model : 'tags',
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
    'Tag',
    function relations(Tag) {
      this.belongsTo(Tag, { as : 'tag', foreignKey : 'tagId' });
    }
  ];
  
  return model;
});
