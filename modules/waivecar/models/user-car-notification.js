'use strict';

Bento.Register.Model('UserCarNotification', 'sequelize', function(model, Sequelize) {
  model.table = 'user_car_notifications';
  
  model.schema = {
    
    user_id : {
      type       : Sequelize.INTEGER,
      allowNull  : false,
      references : {
        model : 'users',
        key   : 'user_id'
      }
    },
    
    latitude : {
      type       : Sequelize.DOUBLE,
      allowNull  : false
    },
    longitude : {
      type       : Sequelize.DOUBLE,
      allowNull  : false
    }
    
  };

  return model;
});
