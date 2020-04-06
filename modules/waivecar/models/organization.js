Bento.Register.Model('Organization', 'sequelize', function register(
  model,
  Sequelize,
) {
  model.table = 'organizations';

  model.schema = {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
    },
    name: {
      type: Sequelize.TEXT(),
      allowNull: false,
    },
  };

  model.relations = [
    'User',
    'Car',
    function(User, Car) {
      this.hasMany(User, {as: 'users'});
      this.hasMany(Car, {as: 'cars'});
    },
  ];
  return model;
});
