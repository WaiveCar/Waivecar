Bento.Register.Model('Telematics', 'sequelize', function register(
  model,
  Sequelize,
) {
  model.table = 'telematics';

  model.schema = {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
    },
    telemId: {
      type: Sequelize.STRING(28),
      primaryKey: true,
    },
    carId: {
      type: Sequelize.STRING(28),
      primaryKey: true,
    },
    lastServiceAt: {
      type: Sequelize.DATE,
    },
  };

  model.relations = [
    'Car',
    function(Car) {
      this.belongsTo(Car, {as: 'car', foreignKey: 'carId'});
    },
  ];
  return model;
});
