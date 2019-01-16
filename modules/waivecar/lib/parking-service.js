'use strict';

let Location = Bento.model('Location');
let User = Bento.model('User');
let UserParking = Bento.model('UserParking');
let ParkingReservation = Bento.model('ParkingReservation');
let ParkingDetails = Bento.model('ParkingDetails');
let Car = Bento.model('Car');
let relay = Bento.Relay;
let log = Bento.Log
let queue = Bento.provider('queue');
let notify = require('./notification-service');
let Email = Bento.provider('email');
let emailConfig = Bento.config.email;
let redis = require('./redis-service');
let error = Bento.Error;
let sequelize = Bento.provider('sequelize');


module.exports = {
  *index() {
    return yield UserParking.find({
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
          model: 'Car',
          as: 'car',
        },
        {
          model: 'User',
          as: 'owner',
        }
      ],
    });
  },

  *create(query) {
    // This is used to create new parking spaces. When new spaces are created, they are
    // not available until they are marked as bookable on the website.
    let user = yield User.findById(query.userId);
    let previousSpaces = yield UserParking.find({
      where: {
        ownerId: user.id,
      }
    });
    if (!previousSpaces.length) {
      let email = new Email(), emailOpts = {};
      try {
        emailOpts = {
          to       : user.email,
          from     : emailConfig.sender,
          subject  : 'Thanks for joining WaivePark. You\'re playing a role in the carsharing revolution!',
          template : 'waivepark-welcome-email',
          context  : {
            name: user.name(),
          }
        };
        yield email.send(emailOpts);
      } catch(err) {
        log.warn('Failed to deliver notification email: ', emailOpts, err);
      }
    }

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
    yield location.update({name: `WaivePark #${ entry.id }` });
    yield notify.notifyAdmins(`:house: ${ user.link() } just made WaivePark #${ entry.id } at ${ query.address }!`, [ 'slack' ], { channel : '#user-alerts' });
    entry.location = location;
    return entry;
  },

  *show(id) {
    return yield UserParking.findOne({
      where: {
        id,
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
          model: 'Car',
          as: 'car',
        },
        {
          model: 'User',
          as: 'owner',
        }
      ],
    });
  },

  *getByUser(userId) {
    // This returns all spaces that are owned by one particular user and puts all of the pertinent
    // information onto the response if it is available.
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
          model: 'Car',
          as: 'car',
        },
      ],
    });
    spaces = yield spaces.map(function*(space) {
      // This adds the reserver of a space to the response if there is a current reservation in it
      let temp = space.toJSON();
      if (temp.reservation) {
        temp.reservedBy = yield User.findById(space.reservation.userId);
      }
      return temp;
    });
    return spaces;
  },

  *findByLocation(locationId) {
    // This returns the space that corresponds to a particular location. This is used for when a
    // user selects one of the locations from the map in the app.
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
      ],
    });
  },

  *fetchReservation(userId) {
    // This route is for fetching a current reservation. It is used when the dashboard component
    // is mounted in the app so that it does not lose the current reservation when the app
    // is closed and reopened.
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

  *emitChanges(space, location, reservation, user, fromApi) {
    // This function is used to emit changes to the socket from all the routes that
    // update the parking spaces. The space and location arguments are optional. The
    // reservation and user argument values are looked up if they are not provided, and
    // true should be passed in for the fromApi argument if the changes are made by an
    // api call rather than by a scheduled process.
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
    if (!fromApi) {
      // This emit is only needed for when reservations expire via the automatic queue process.
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
    // This is for deleting spaces. It deletes the parking space and associated location.
    try {
      let parking = yield UserParking.findById(parkingId);
      let location = yield Location.findById(parking.locationId);
      yield parking.delete();
      yield location.delete();
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
    // This is used to toggle boolean properties of spaces. The value of type
    // will generally be ownerOccupied or waivecarOccupied. Availability of the space
    // based on these two properties is also toggled on the corresponding location.
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
    yield this.emitChanges(space, location);
    return space;
  },

  *updateParking(parkingId, updateObj) {
    // This function is currently only used for updating the note on a parking space, 
    // but can be used to update any properties on a parking entry and the corresponding 
    // location entry.
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
    // This reserves a parking space for a user and makes the necessary updates to
    // the corresponding location object. It also creates a reservation object.
    let user = yield User.findById(userId);
    let space = yield UserParking.findById(parkingId);
    let location = yield Location.findById(space.locationId);
    // This conditional should ensure that the space does not get double booked.
    if (yield redis.shouldProcess('parking-reservation', space.id, 9 * 1000)) {
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

      // The process below makes the parking space reservations expire after 5 minutes
      // and takes all necessary auxiliary actions.
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

      yield this.emitChanges(space, location, reservation, user);

      yield notify.notifyAdmins(
        `:bellhop_bell: ${ user.link() } reserved parking spot #${space.id}`,
        ['slack'],
        {channel: '#reservations'},
      );
      space.reservation = reservation;
      space.location = location;
      return space;
    }
    throw error.parse(
      // This is thrown if the space is being double booked.
      {
        code: 'SPACE_BEING_RESERVED_BY_OTHER_USER',
        message: `Space #${
          space.id
        } was booked by another user while you were trying to book it.`,
      },
      400,
    );
  },

  *occupy(parkingId, carId, reservationId) {
    // This is used when a car is lefty in a space by a current reservation. It
    // makes all changes that are necessitated by this action.
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
    yield this.emitChanges(space, location, reservation, null, true);
    let car = yield Car.findById(carId);
    // This sends a text to the owner of a space that a car has been parked in it.
    yield notify.sendTextMessage(
      space.ownerId,
      `${car.license} has been parked in your parking space`,
    );
    space = space.toJSON();
    space.location = location.toJSON();
    space.reservation = reservation.toJSON();
    return space;
  },

  *vacate(carId) {
    // This function is used to remove a car from a space when a new booking starts and
    // and the car is in it. It is also used by the web app as a way of force removing
    // cars from spaces.
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
    // This is used for cancellation of reservations it is used by both a route for
    // cancelling reservations directly and by the booking-auto-cancel process.
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
      yield this.emitChanges(space, location, reservation, null, fromApi);
    } else {
      // This error is thrown when a space is no longer reserved by the user trying
      // to cancel the reservation.
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

  // payload is an array of lat/lng
  *query(payload) {
    let resAll = [];
    let threshold = 0.001;

    var start = new Date();
    for(let row of payload.qstr) {
      row.latitude = parseFloat(row.latitude);
      row.longitude = parseFloat(row.longitude);
      if(!isNaN(row.latitude) && !isNaN(row.longitude)) {
        let qstr = [
          `select bd.id, address as addr, pd.path, pd.created_at, latitude as lat, longitude as lng, abs(latitude - ${row.latitude}) + abs(longitude - ${row.longitude}) as dist`,
          'from booking_details bd join parking_details pd on bd.id = pd.booking_id',
          'where bd.type = "end" and pd.created_at > date_sub(current_timestamp, interval 22 month) and path is not null',
          `having dist < ${threshold}`,
          'order by dist asc limit 5'
        ].join(' ');
        row.results = (yield sequelize.query(qstr, {type: sequelize.QueryTypes.SELECT}));
      }
      resAll.push(row);
    }
    console.log(new Date() - start, payload.qstr.length);
    return resAll;
  }
};
