'use strict';

Bento.Register.Model('ActionEngine', 'sequelize', function(model, Sequelize) {

  model.table = 'action_engine';

  model.schema = {
    eventName : { 
      type : Sequelize.STRING, 
      allowNull : false 
    },

    objectId : { 
      type     : Sequelize.INTEGER
    },

    state : { 
      type : Sequelize.STRING
    }
  };

  return model;

});
