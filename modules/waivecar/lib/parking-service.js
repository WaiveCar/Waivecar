'use strict';

let Location = Bento.model('Location');
let UserParking = Bento.model('UserParking');
let relay = Bento.Relay;
let queue = Bento.provider('queue');
let notify = require('./notification-service');

module.exports = {
  *create(query, _user) {
    let location = new Location({
      type: 'user-parking',
      latitude: query.latitude,
      longitude: query.longitude,
      address: query.address,
      radius: 20,
      status: 'available',
    });
    yield location.save();
    let entry = new UserParking({
      locationId: location.id,
      ownerId: query.ownerId, // This will need to be changed to _user.id once this route is used with authorization
      notes: query.notes,
    });
    yield entry.save();
    return entry;
  },

  *toggle(parkingId, type) {
    let space = yield UserParking.findById(parkingId);
    let updateObj = {};
    updateObj[type] = !space[type];
    yield space.update(updateObj);
    return space;
  },

  *updateParking(parkingId, updateObj) {
    let space = yield UserParking.findById(parkingId);
    yield space.update(updateObj);
    let location = yield Location.findById(space.locationId);
    yield location.update(updateObj);
    return {
      space,
      location,
    };
  },

  *reserve(parkingId, _user, userId) {
    // Remove  this through line 52 later
    _user = {
      id: 555,
      firstName: 'first',
      lastName: 'last',
    };

    let space = yield UserParking.findById(parkingId);
    yield space.update({
      reserved: true,
      reservedById: _user.id, //_user.id,
      reservedAt: new Date(new Date().toUTCString()),
    });

    let timerObj = {value: 5, type: 'minutes'};
    queue.scheduler.add('parking-auto-cancel', {
      uid: `parking-${parkingId}`,
      timer: timerObj,
      data: {
        spaceId: space.id,
        user: _user,
      },
    });
    yield notify.notifyAdmins(
      `:parking: ${_user.firstName} ${
        _user.lastName
      } has reserved parking spot #${space.id}`,
      ['slack'],
      {channel: '#reservations'},
    );
    return space;
  },

  *cancel(parkingId, _user) {
    let space = yield UserParking.findById(parkingId);
    console.log('Space before: ', space);
    let currentUserId = space.reservedById;
    yield space.update({
      reserved: false,
      reservedById: null,
      reservedAt: null,
    });
    relay.user(currentUserId, 'userParking', {
      type: 'update',
      data: space.toJSON(),
    });
    relay.admin('userParking', {
      type: 'update',
      data: space.toJSON(),
    });
    return space;
  },
};
