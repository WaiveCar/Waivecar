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
      allowNull: false,
    },
    carId: {
      type: Sequelize.STRING(28),
      primaryKey: true,
      defaultValue: null,
    },
    lastSeeenAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW, 
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
