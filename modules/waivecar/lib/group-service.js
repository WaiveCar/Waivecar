'use strict';

let error  = Bento.Error;

let GroupRole = Bento.model('GroupRole');
let Car       = Bento.model('Car');
let GroupCar  = Bento.model('GroupCar');

let User   = Bento.model('User');

let config = Bento.config;

class GroupService {
  static *index() {
    let query = {};

    query.order = [
      ['name', 'ASC']
    ];
    return yield GroupRole.find(query);
  }

  static *create(payload) {

    //groupId - this column is footprint of old functionality
    //set it always = 1 just for now
    if(payload) {
      payload.groupId = 1;
    }

    let groupRole = new GroupRole(payload);

    yield groupRole.save();

    groupRole.relay({
      type: 'store'
    });

  }

  static *update(id, payload) {
    let groupRole = yield GroupRole.findById(id);
    if(groupRole) {
      yield groupRole.update(payload);
    }
  }

  static *delete(id) {
    let groupRole = yield GroupRole.findById(id);
    if(groupRole) {
      yield groupRole.delete();
    }
  }

  static *assignCar(groupRoleId, carId) {
    let groupCar = new GroupCar({
      groupRoleId: groupRoleId,
      carId: carId
    });

    yield groupCar.save();

    groupCar.relay({
      type: 'store'
    });
  }

  static *removeCar(groupRoleId, carId) {
    let groupCar = yield GroupCar.findOne({
      where : {
        groupRoleId: groupRoleId,
        carId: carId
      }
    });

    if(groupCar) {
      yield groupCar.delete();
    }
  }

  static *getGroupCars(groupRoleId) {
    let options = {
      where: {
        groupRoleId: groupRoleId
      },
      include : [
        {
          model : 'Car',
          as    : 'car'
        }
      ]
    };
    let groupCars = yield GroupCar.find(options);
    console.log(groupCars);

    return groupCars.map(x => x.car);
  }
};

module.exports = GroupService;
