'use strict';

let Location = Bento.model('Location');
let User = Bento.model('User');
let UserParking = Bento.model('UserParking');
let ParkingReservation = Bento.model('ParkingReservation');
let relay = Bento.Relay;
let queue = Bento.provider('queue');
let notify = require('./notification-service');
let error = Bento.Error;

module.exports = {
  *create(query) {
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
      ownerId: query.userId,
      notes: query.notes,
    });
    yield entry.save();
    entry.location = location;
    return entry;
  },

  *getByUser(userId) {
    return yield UserParking.find({
      where: {
        ownerId: userId,
      },
      include: [
        {
          model: 'Location',
          as: 'location',
        },
      ],
    });
  },

  *delete(parkingId) {
    // This function remains to be emplemented. Further discussion needed
    return 'To Be implemented in the future';
  },

  *toggle(parkingId, type) {
    // The value of type will generally be ownerOccupied or waivecarOccupied
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

  *reserve(parkingId, userId) {
    let user = yield User.findById(userId);
    let space = yield UserParking.findById(parkingId);
    if (space.reservationId) {
      throw error.parse(
        {
          code: 'PARKING_ALREADY_RESERVED',
          message: `Parking space ${space.id} is already reserved`,
        },
        400,
      );
    }
    let reservation = new ParkingReservation({
      userId: user.id,
      spaceId: space.id,
    });
    yield reservation.save();

    yield space.update({
      reservationId: reservation.id,
    });

    let timerObj = {value: 5, type: 'minutes'};
    queue.scheduler.add('parking-auto-cancel', {
      uid: `parking-${parkingId}`,
      timer: timerObj,
      data: {
        spaceId: space.id,
        reservation,
        user,
      },
    });

    yield notify.notifyAdmins(
      `:parking: ${user.firstName} ${
        user.lastName
      } has reserved parking spot #${space.id}`,
      ['slack'],
      {channel: '#reservations'},
    );
    return space;
  },

  *cancel(parkingId, userId, currentReservationId) {
    let space = yield UserParking.findById(parkingId);
    if (space.reservationId === currentReservationId) {
      yield space.update({
        reservationId: null,
      });
      relay.user(userId, 'userParking', {
        type: 'update',
        data: space.toJSON(),
      });
      relay.admin('userParking', {
        type: 'update',
        data: space.toJSON(),
      });
    } else {
      throw error.parse(
        {
          code: 'PARKING_NOT_RESERVED_BY_USER',
          message: `Parking space #${
            space.id
          } was not reserved by user #${userId}`,
        },
        400,
      );
    }
    return space;
  },
};
