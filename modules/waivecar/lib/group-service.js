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
    let tagList = yield GroupCar.findOne({
      where : {
        carId: carId
      }
    });

    if(!tagList) {
      tagList = new GroupCar({
        carId: carId,
        groupRoleId: groupRoleId
      });

      yield tagList.save();

      tagList.relay({
        type: 'store'
      });
    } else {
      yield tagList.update({
        groupRoleId: groupRoleId
      });
    }

    return tagList;
  }

  static *removeCar(groupRoleId, carId) {
    let tagList = yield GroupCar.findOne({
      where : {
        groupRoleId: groupRoleId,
        carId: carId
      }
    });

    if(tagList) {
      yield tagList.delete();
    }
  }
};

module.exports = GroupService;
