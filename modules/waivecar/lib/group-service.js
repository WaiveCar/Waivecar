'use strict';

let error  = Bento.Error;

let Car       = Bento.model('Car');
let User   = Bento.model('User');

let GroupRole = Bento.model('GroupRole');
let GroupCar  = Bento.model('GroupCar');
let GroupUser = Bento.model('GroupUser');

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

    // See #1077. Currently one to one relation.
    let groupCar = yield GroupCar.findOne({
      where : {
        carId: carId
      }
    });

    if(!groupCar) {
      groupCar = new GroupCar({
        carId: carId,
        groupRoleId: groupRoleId
      });

      yield groupCar.save();

      groupCar.relay({
        type: 'store'
      });
    } else {
      yield groupCar.update({
        groupRoleId: groupRoleId
      });
    }

    return groupCar;
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
};

module.exports = GroupService;
