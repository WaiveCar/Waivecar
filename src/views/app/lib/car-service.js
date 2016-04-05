import { api, auth, dom, helpers } from 'bento';
import Service                     from './component-service';
import async                       from 'async';

module.exports = class Car extends Service {

  /**
   * Stores the provided context.
   * @param {Object} ctx
   */
  constructor(ctx) {
    super(ctx, 'car', {
      isLoading : false,
      cars      : []
    });
    this.update = this.update.bind(this);
    this.executeCommand = this.executeCommand.bind(this);
  }

  executeCommand(car, command) {
    this.setState('isLoading', true);
    api.put(`/cars/${ car.id }/${ command }`, { }, function (err, model) {
      this.setState('isLoading', false);
      if (err) {
        return this.error(err.data ? err.data : err.message);
      }

      this.updateCarState(model);
      this.success('Command completed successfully.');
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

  /**
   * Loads car from the api and adds it to ctx.
   */
  setCar(id) {
    api.get(`/cars/${ id }`, (err, car) => {
      if (err) return this.error(err.message);

      api.get(`/bookings?carId=${ car.id }&status=started&details=true`, (err, bookings) => {
        car.booking = bookings[0];
        this.updateCarState(car);
      });
    });
  }
}
