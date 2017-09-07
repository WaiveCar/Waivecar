'use strict';

Bento.Register.Model('Ticket', 'sequelize', function(model, Sequelize) {
  model.table = 'tickets';

  model.schema = {

    carId : {
      type       : Sequelize.STRING(28),
      references : {
        model : 'cars',
        key   : 'id'
      }
    },

    assigneeId : {
      type       : Sequelize.INTEGER,
      references : {
        model : 'assignees',
        key   : 'id'
      }
    },

    creatorId : {
      type       : Sequelize.INTEGER,
      allowNull  : false,
      references : {
        model : 'assignees',
        key   : 'id'
      }
    },

    status : {
      type         : Sequelize.ENUM('open', 'inprogress', 'closed'),
      defaultValue : 'open'
    },

    action : {
      type      : Sequelize.STRING(250),
      allowNull : false
    }
  };

  model.attributes = [
    'creator',
    'car',
    'assignee'
  ];

  model.relations = [
    'User',
    'Car',
    function(User, Car) {
      this.belongsTo(User, { as : 'creator', foreignKey : 'creatorId' });
      this.belongsTo(User, { as : 'assignee', foreignKey : 'assigneeId' });
      this.belongsTo(Car, { as : 'car', foreignKey : 'carId' });
    }
  ];

  return model;
});
