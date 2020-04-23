let error = Bento.Error;
let Car = Bento.model('Car');
let User = Bento.model('User');
let OrganizationUser = Bento.model('OrganizationUser');
let notify = require('../lib/notification-service');
let apiConfig = Bento.config.api;

Bento.Register.Model('Organization', 'sequelize', function register(
  model,
  Sequelize,
) {
  model.table = 'organizations';

  model.schema = {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
  };

  model.methods = {
    link: function() {
      return `<${apiConfig.uri}/organizations/${this.id}|${this.name}>`;
    },
    addCar: function*(payload) {
      let {carId} = payload;
      let car = yield Car.findOne({where: {id: carId}});
      if (car.organizationId) {
        throw error.parse(
          {
            code: 'CAR_ALREADY_ASSIGNED',
            message: `${car.license} has already been assigned to an organization. Please remove the car from its old organization before adding it to a new one.`,
          },
          500,
        );
      }
      yield car.update({organizationId: this.id});
      yield notify.notifyAdmins(
        `:blue_car: ${car.link()} added to ${this.link()}`,
        ['slack'],
        {channel: '#organizations'},
      );
      return this;
    },
    removeCar: function*(payload) {
      let {carId} = payload;
      let car = yield Car.findOne({where: {id: carId}});
      if (this.id === car.organizationId) {
        yield car.update({organizationId: null});
        yield notify.notifyAdmins(
          `:ski: ${car.link()} removed from ${this.link()}`,
          ['slack'],
          {channel: '#organizations'},
        );
      }
      return this;
    },
    addUser: function*(payload) {
      let {userId} = payload;
      let user = yield User.findById(userId);
      let prevUser = yield OrganizationUser.findOne({
        where: {userId, organizationId: this.id},
      });
      if (prevUser) {
        throw error.parse(
          {
            code: 'USER_ALREADY_ADDED',
            message: `${user.name()} has already been added to this organization.`,
          },
          500,
        );
      }
      let orgUser = new OrganizationUser({
        organizationId: this.id,
        userId,
      });
      yield orgUser.save();
      yield notify.notifyAdmins(
        `:stadium: ${user.link()} added to ${this.link()}`,
        ['slack'],
        {channel: '#organizations'},
      );
      return this;
    },
    removeUser: function*(payload) {
      let {userId} = payload;
      let user = yield User.findById(userId);
      let orgUser = yield OrganizationUser.findOne({
        where: {
          organizationId: this.id,
          userId,
        },
      });
      if (orgUser) {
      yield orgUser.delete();
        yield notify.notifyAdmins(
          `:metro: ${user.link()} removed from ${this.link()}`,
          ['slack'],
          {channel: '#organizations'},
        );
        return orgUser;
      }
    },
    addCars: function*(payload) {
      let {carsList} = payload;
      let errs = [];
      for (let car of carsList) {
        try {
          yield this.addCar({carId: car.id});
        } catch (e) {
          errs.push(car.license);
        }
      }
      if (errs.length) {
        throw error.parse(
          {
            code: 'CAR_ALREADY_ASSIGNED',
            message: `${errs.join(
              ', ',
            )} have already been assigned to an organization. Please remove the cars from their old organizations before adding them to a new one.`,
          },
          500,
        );
      }
      return this;
    },
    removeCars: function*(payload) {
      let {carsList} = payload;
      for (let car of carsList) {
        yield this.removeCar({carId: car.id});
      }
      return this;
    },
    addUsers: function*(payload) {
      let {usersList} = payload;
      let errs = [];
      for (let user of usersList) {
        try {
          yield this.addUser({userId: user.id});
        } catch (e) {
          errs.push(user.name());
        }
      }
      if (errs.length) {
        throw error.parse(
          {
            code: 'USERS_ALREADY_ADDED',
            message: `${errs.join(
              ', ',
            )} have already been added to this organization.`,
          },
          500,
        );
      }
      return this;
    },
    removeUsers: function*(payload) {
      let {usersList} = payload;
      for (let user of usersList) {
        yield this.removeUser({userId: user.id});
      }
      return this;
    },
  };

  model.relations = [
    'OrganizationUser',
    'Car',
    function(OrganizationUser, Car) {
      this.hasMany(OrganizationUser, {as: 'organizationUsers'});
      this.hasMany(Car, {as: 'cars'});
    },
  ];
  return model;
});
