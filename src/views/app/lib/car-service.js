import { api, auth, dom, helpers } from 'bento';
import { snackbar }                from 'bento-web';
import Service                     from './component-service';
import async                       from 'async';
import moment                      from 'moment';

module.exports = class Car extends Service {

  constructor(ctx) {
    super(ctx, 'car', {
      isLoading : false,
      updatedAt : null,
      cars      : []
    });
    this.update = this.update.bind(this);
    this.executeCommand = this.executeCommand.bind(this);
  }

  executeCommand(car, command, opts) {
    if(!opts || opts.constructor.name == 'SyntheticMouseEvent') {
      opts = {};
    }

    if(command === 'refresh') {
      return this.setCar(car.id);
    }
    this.setState('isLoading', true);
    api.put(`/cars/${ car.id }/${ command }`, opts, function (err, model) {
      this.setState('isLoading', false);
      if (err) {
        snackbar.notify({
          type    : 'danger',
          message : `Error updating car: ${err.message}`
        });
        return this.error(err.data ? err.data : err.message);
      }
      this.setState('updatedAt', moment(model.updatedAt).format('h:mm:ss A'));
      this.getBooking(model, () => {
        this.success('Command completed successfully.');
      });
    }.bind(this));
  }

  update(data) {
    this.save(auth.user(), data, function (err, model) {
      if (err) {
        return this.error(err.data ? err.data : err.message);
      }

      //
      // This is just the model, and not the model with relations.
      // Sooo if you do this, you'll blow away the relation data
      // and then cause everything to blow up. 
      //
      // This was here before and it's commented out and not removed
      // to make it known that adding it in would be a bug. 
      //
      // Don't do it sweetie.
      //
      // this.updateCarState(model);
      //
      
      this.success('Car was updated successfully.');
    }.bind(this));
  }

  save(user, car, done) {
    api.put(`/cars/${ car.id }`, {
      id           : car.id,
      make         : car.make,
      plateNumber  : car.plateNumberWork,
      model        : car.model,
      year         : car.year,
      manufacturer : car.manufacturer,
      license      : car.license,
      vin          : car.vin,
      isAvailable  : car.isAvailable,
    }, function (err, model) {
      if (err) {
        return done(err);
      }
      return done(null, model);
    }.bind(this));
  }

  updateCarState(car) {
    // ### Update State
    this.setState('cars', function () {
      let models  = this.getState('cars');
      let result = [ car ];
      models.forEach((model) => {
        if (model.id !== car.id) {
          result.push(model);
        }
      });
      return result;
    }.call(this));
  }

  setCar(id, cb) {
    api.get(`/cars/${ id }`, (err, car) => {
      if (err) {
        return this.error(err.message);
      }

      car.lastUpdated = (new Date()).toLocaleTimeString();
      this.getBooking(car);
      if (cb) {
        cb(car);
      }
    });
  }

  getBooking(car, cb) {
    api.get(`/bookings?carId=${ car.id }&details=true&order=created_at,DESC&limit=1`, (err, bookings) => {
      let booking = bookings[0] || {};
      if (booking.status === 'reserved' || booking.status === 'started') car.booking = booking;
      this.updateCarState(car);
      if (cb) cb(booking);
    });
  }

  updateCarGroup(car, newGroupRoleId) {
    // #1077. Currently we support only 1 to 1 relation
    var oldGroupRoleId = '';
    if(car.tagList && car.tagList[0]) {
      oldGroupRoleId = car.tagList[0].groupRoleId;
    }

    if(newGroupRoleId == '') {
      return api.delete(`/group/${oldGroupRoleId}/removecar/${car.id}`, (err) => {
        if(err) {
          return this.error(err.data ? err.data : err.message);
        }

        return this.success('Removed car from group');
      });
    } else {
      api.post(`/group/${newGroupRoleId}/assigncar/${car.id}`, {}, (err, tagList) => {
        if(err) {
          return this.error(err.data ? err.data : err.message);
        }

        car.tagList[0] = tagList;
        this.updateCarState(car);
        return this.success('Car\'s group was updated');
      });
    }

    
    
  }
}
