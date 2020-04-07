let Car = Bento.model('Car');
let User = Bento.model('User');
let OrganizationUser = Bento.model('OrganizationUser');

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

  model.methods = {
    addCar: function*(carId) {
      let car = yield Car.findById(carId);
      yield car.update({organizationId: this.id});
    },
    removeCar: function*(carId) {
      let car = yield Car.findById(carId);
      yield car.update({organizationId: null});
    },
    addUser: function*(userId) {
      let orgUser = new OrganizationUser({
        organizationId: this.id,
        userId,
      });
      yield orgUser.save();
    },
    removeUser: function*(userId) {
      let orgUser = yield OrganizationUser.findOne({
        where: {
          organizationId: this.id,
          userId,
        },
      });
      yield orgUser.delete();
    },
  };

  model.relations = [
    'User',
    'Car',
    function(User, Car) {
      //this.hasMany(User, {as: 'user'});
      //this.hasMany(Car, {as: 'car'});
    },
  ];
  return model;
});
