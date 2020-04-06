Bento.Register.Model('Organization', 'sequelize', function register(model, Sequelize) {
  
  model.table = 'organizations';

  model.schema = {
    id : {
      type       : Sequelize.STRING(28),
      primaryKey : true
    },
    name: {
      type: Sequelize.TEXT(),
      allowNull: false,
    },
  };
});
