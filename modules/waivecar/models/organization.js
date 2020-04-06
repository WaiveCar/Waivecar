Bento.Register.Model('Organization', 'sequelize', function register(model, Sequelize) {
  
  model.table = 'organizations';

  model.schema = {
    id : {
      type       : Sequelize.INTEGER,
      primaryKey : true
    },
    name: {
      type: Sequelize.TEXT(),
      allowNull: false,
    },
  };
  return model;
});
