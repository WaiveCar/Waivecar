'use strict';

let Location = Bento.model('Location');
let UserParking = Bento.model('UserParking');

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
    console.log(location);
    let entry = new UserParking({
      locationId: location.id,
      ownerId: query.ownerId,
      notes: query.notes,
    });
    yield entry.save();
    console.log(entry);
    return entry;
  },

  *toggle(parkingId, type) {
    let space = yield UserParking.findById(parkingId); 
    let updateObj = {};
    updateObj[type] = !space[type];
    yield space.update(updateObj);
    return space;
  },
};
