'use strict';

Bento.Register.Model('CarHistory', 'sequelize', function(model, Sequelize) {
  model.table = 'car_history';

  model.sequelizeOptionMap = {
    updatedAt: false,
    deletedAt: false,
    paranoid: false
  };

  model.schema = {
    carId : {
      type       : Sequelize.STRING(28),
      references : {
        model : 'cars',
        key   : 'id'
      }
    },

    action : {
      type      : Sequelize.STRING(64),
      allowNull : false
    },

    data : {
      type      : Sequelize.STRING(64),
      allowNull : false
    },

    createdAt : {
      type: Sequelize.DATE
    }
  };

  model.attributes = [
    'car'
  ];

  model.relations = [
    'Car',
    function(Car) {
      this.belongsTo(Car, { as : 'car', foreignKey : 'carId' });
    }
  ];

  return model;

});
