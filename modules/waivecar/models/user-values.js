'use strict';

Bento.Register.Model('UserValues', 'sequelize', (model, Sequelize) => {

  model.table = 'user_values';

  model.sequelizeOptionMap = {
    updatedAt: false,
    deletedAt: false,
    paranoid: false
  };

  model.schema = {

    userId : {
      type       : Sequelize.INTEGER
    },

    key : {
      type       : Sequelize.STRING
    },

    value : {
      type       : Sequelize.FLOAT
    },

    ttl : {
      type       : Sequelize.INTEGER
    },
  };

  return model;

});
