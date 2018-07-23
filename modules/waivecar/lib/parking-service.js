'use strict';

let Location = Bento.model('Location');
let UserParking = Bento.model('UserParking');
let queue = Bento.provider('queue');

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
    let space = yield UserParking.findById(parkingId);
    yield space.update({
      reserved: true,
      reservedById: userId, //_user.id,
      reservedAt: new Date(new Date().toUTCString()),
    });
    let reservationLength = 2000//5 * 60000; // makes reservation 5 minutes long
    setTimeout(() => {
      function* gen() {
        console.log('did the timeout work?');
        try {
        yield space.update({
          reserved: false,
          reservedById: null,
          reservedAt: null,
        });
        console.log(space);
        } catch(e) {
          console.log('error: ', e);
        }
      }
      let y = gen();
      y.next();
    }, reservationLength);
    return space;
  }
};
