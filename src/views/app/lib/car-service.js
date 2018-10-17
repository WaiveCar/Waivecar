import { api, auth, dom, helpers } from 'bento';
import { snackbar }                from 'bento-web';
import Service                     from './component-service';
import async                       from 'async';
import moment                      from 'moment';

module.exports = class Car extends Service {

  /**
   * Stores the provided context.
   * @param {Object} ctx
   */
  constructor(ctx) {
    super(ctx, 'car', {
      isLoading : false,
      updatedAt : null,
      cars      : []
    });
    this.update = this.update.bind(this);
    this.executeCommand = this.executeCommand.bind(this);
  }

  executeCommand(car, command) {
    if(command === 'refresh') {
      return this.setCar(car.id);
    }
    this.setState('isLoading', true);
    api.put(`/cars/${ car.id }/${ command }`, { }, function (err, model) {
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

  /**
   * Form submission method for bento-web form component.
   * @param  {Object}   data
   * @param  {Function} reset
   */
  update(data) {
    this.save(auth.user(), data, function (err, model) {
      if (err) {
        return this.error(err.data ? err.data : err.message);
      }

      this.updateCarState(model);
      this.success('Car was updated successfully.');
    }.bind(this));
  }

  /**
   * Save updates made to the Car form
   * @param {Object}   user
   * @param {Object}   car
   * @param {Function} done
   */
  save(user, car, done) {
    api.put(`/cars/${ car.id }`, {
      id           : car.id,
      make         : car.make,
      plateNumber : car.plateNumber,
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

  setCar(id) {
    api.get(`/cars/${ id }`, (err, car) => {
      if (err) {
        return this.error(err.message);
      }

      car.lastUpdated = (new Date()).toLocaleTimeString();
      this.getBooking(car);
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
