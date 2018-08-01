'use strict';

let Location = Bento.model('Location');
let User = Bento.model('User');
let UserParking = Bento.model('UserParking');
let ParkingReservation = Bento.model('ParkingReservation');
let ParkingDetails = Bento.model('ParkingDetails');
let relay = Bento.Relay;
let queue = Bento.provider('queue');
let notify = require('./notification-service');
let error = Bento.Error;
let sequelize = Bento.provider('sequelize');

module.exports = {
  *create(query) {
    let location = new Location({
      type: 'user-parking',
      latitude: query.latitude,
      longitude: query.longitude,
      address: query.address,
      radius: 20,
      status: 'unavailable',
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
    let spaces = yield UserParking.find({
      where: {
        ownerId: userId,
      },
      include: [
        {
          model: 'Location',
          as: 'location',
        },
        {
          model: 'ParkingReservation',
          as: 'reservation',
        },
        {
          model: 'ParkingDetails',
          as: 'parkingDetails',
        },
      ],
    });
    spaces = yield spaces.map(function*(space) {
      let temp = space.toJSON();
      if (temp.reservation) {
        temp.reservedBy = yield User.findById(space.reservation.userId);
      }
      return temp;
    });
    return spaces;
  },

  *delete(parkingId) {
    try {
      let parking = yield UserParking.findById(parkingId);
      let location = yield Location.findById(parking.locationId);
      // These raw queries are used to create a hard delete. The sequelize.delete function only does a soft delete
      yield sequelize.query(`DELETE FROM user_parking WHERE id=${parking.id}`);
      yield sequelize.query(
        `DELETE FROM locations WHERE id=${parking.locationId}`,
      );
      return {
        parking,
        location,
      };
    } catch (err) {
      throw error.parse(
        {
          code: 'ERROR_DELETING_PARKING',
          message: `Error deleting parking space: ${err}`,
        },
        400,
      );
    }
  },

  *toggle(parkingId, type) {
    // The value of type will generally be ownerOccupied or waivecarOccupied
    let space = yield UserParking.findById(parkingId);
    let updateObj = {};
    updateObj[type] = !space[type];
    yield space.update(updateObj);
    let location = yield Location.findById(space.locationId);
    let newStatus =
      space.ownerOccupied || space.waivecarOccupied
        ? 'unavailable'
        : 'available';
    yield location.update({
      status: newStatus,
    });
    return space;
  },

  *updateParking(parkingId, updateObj) {
    try {
      let space = yield UserParking.findById(parkingId);
      yield space.update(updateObj);
      let location = yield Location.findById(space.locationId);
      yield location.update(updateObj);
      return {
        space,
        location,
      };
    } catch (err) {
      throw error.parse(
        {
          code: 'ERROR_UPDATING_PARKING',
          message: `Error updating parking space: ${err}`,
        },
        400,
      );
    }
  },

  *reserve(parkingId, userId) {
    let user = yield User.findById(userId);
    let space = yield UserParking.findById(parkingId);
    if (space.reservationId) {
      throw error.parse(
        {
          code: 'SPACE_ALREADY_RESERVED',
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

    let location = yield Location.findById(space.locationId);
    yield location.update({
      status: 'unavailable',
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
      let location = yield Location.findById(space.locationId);
      if (!space.ownerOccupied) {
        yield location.update({
          status: 'available',
        });
      }
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
