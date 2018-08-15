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
    let user = yield User.findById(query.userId);
    let location = new Location({
      name: `${user.firstName} ${user.lastName}'s Personal Parking`,
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
        {
          model: 'Car',
          as: 'car',
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

  *findByLocation(locationId) {
    return yield UserParking.findOne({
      where: {
        locationId,
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
  },

  *fetchReservation(userId) {
    let reservation = yield ParkingReservation.findOne({
      where: {
        userId,
        expired: false,
      },
    });
    if (reservation) {
      return yield UserParking.findOne({
        where: {
          reservationId: reservation.id,
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
        ],
      });
    }
    throw error.parse(
      {
        code: 'USER_HAS_NO_CURRENT_RESERVATION',
        message: 'User has no active parking reservation',
      },
      400,
    );
  },

  *emitChanges(space, location, reservation, user, parkingDetails, fromApi) {
    let json = space.toJSON();
    json.location = location.toJSON();
    if (space.reservationId) {
      json.reservation = reservation
        ? reservation
        : yield ParkingReservation.findById(space.reservationId);
      json.reservation = json.reservation.toJSON();
      json.reservedBy = user
        ? user
        : yield User.findById(json.reservation.userId);
      json.reservedBy = json.reservedBy.toJSON();
    }
    if (space.parkingDetailId) {
      json.parkingDetails = parkingDetails
        ? parkingDetails
        : yield ParkingDetails.findById(space.parkingDetailId);
      json.parkingDetails = json.parkingDetails.toJSON();
    }
    if (!fromApi) {
      relay.emit('userParking', {
        type: 'update',
        data: json,
      });
    }
    relay.emit('locations', {
      type: 'update',
      data: json.location,
    });
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
    // This happens if someone is trying to make their space unavailable while it is reserved.
    // It is not currently used, but may be added back in later
    /*
    if (space.reservationId && !space.ownerOccupied) {
      throw error.parse(
        {
          code: 'SPACE_CURRENTLY_RESERVED',
          message:
            'Spaces cannot be made unavailable while they are reserved by users',
        },
        400,
      );
    }
    */

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
    yield this.emitChanges(space, location);
    return space;
  },

  *updateParking(parkingId, updateObj) {
    // This function is not currently used, but can be used to update any properties
    // on a parking entry and the corresponding location entry
    try {
      let space = yield UserParking.findById(parkingId);
      yield space.update(updateObj);
      let location = yield Location.findById(space.locationId);
      yield location.update(updateObj);
      yield this.emitChanges(space, location);
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
    let location = yield Location.findById(space.locationId);
    if (space.reservationId) {
      throw error.parse(
        {
          code: 'SPACE_ALREADY_RESERVED',
          message: `Parking space ${space.id} is already reserved.`,
        },
        400,
      );
    }
    if (location.status === 'unavailable') {
      throw error.parse(
        {
          code: 'SPACE_NOT_CURRENTLY_AVAILABLE',
          message: `Space #${
            space.id
          } is unavailable. It is likely to be owner occupied`,
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

    yield location.update({
      status: 'unavailable',
    });

    let timerObj = {value: 5, type: 'minutes'};
    queue.scheduler.add('parking-auto-cancel', {
      uid: `parking-reservation-${reservation.id}`,
      timer: timerObj,
      unique: true,
      data: {
        spaceId: space.id,
        reservation,
        user,
      },
    });

    yield this.emitChanges(space, location, reservation, user, null);

    yield notify.notifyAdmins(
      `:parking: ${user.firstName} ${
        user.lastName
      } has reserved parking spot #${space.id}`,
      ['slack'],
      {channel: '#reservations'},
    );
    space.reservation = reservation;
    space.location = location;
    return space;
  },

  *occupy(parkingId, carId, reservationId) {
    // If parking is aborted, space needs to be made available
    let space = yield UserParking.findById(parkingId);
    queue.scheduler.cancel(
      'parking-auto-cancel',
      `parking-reservation-${space.reservationId}`,
    );
    yield space.update({
      reservationId: null,
      waivecarOccupied: true,
      carId,
    });
    let location = yield Location.findById(space.locationId);
    let reservation = yield ParkingReservation.findById(reservationId);
    yield reservation.update({
      expired: true,
    });
    yield this.emitChanges(space, location, reservation);
    space = space.toJSON();
    space.location = location.toJSON();
    space.reservation = reservation.toJSON();
    return space;
  },

  *vacate(carId) {
    let space = yield UserParking.findOne({where: {carId}});
    if (space) {
      yield space.update({
        carId: null,
        waivecarOccupied: false,
      });
      let location = yield Location.findById(space.locationId);
      if (!space.userOccupied) {
        yield location.update({
          status: 'available',
        });
      }
      yield this.emitChanges(space, location);
      space = space.toJSON();
      space.location = location.toJSON();
    }
    return space;
  },

  *cancel(parkingId, currentReservationId, fromApi) {
    let space = yield UserParking.findById(parkingId);
    let reservation = yield ParkingReservation.findById(currentReservationId);
    yield reservation.update({
      expired: true,
    });
    if (!space.reservationId) {
      throw error.parse(
        {
          code: 'PARKING_NOT_RESERVED',
          message: `Parking space #${space.id} is not currently reserved.`,
        },
        400,
      );
    }
    if (space.reservationId === currentReservationId) {
      yield space.update({
        reservationId: null,
      });
      let location = yield Location.findById(space.locationId);
      if (!space.ownerOccupied) {
        yield location.update({
          status: 'available',
        });
      }
      yield this.emitChanges(space, location, reservation, null, null, fromApi);
    } else {
      throw error.parse(
        {
          code: 'PARKING_NOT_RESERVED_BY_USER',
          message: `Parking space #${
            space.id
          } does not correspond with this reservation`,
        },
        400,
      );
    }
    queue.scheduler.cancel(
      'parking-auto-cancel',
      `parking-reservation-${currentReservationId}`,
    );
    return space;
  },
};
