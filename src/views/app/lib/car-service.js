'use strict';

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
      car : {}
    });
    this.update = this.update.bind(this);
    this.executeCommand = this.executeCommand(this)
  }

  executeCommand(command) {
    return;
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

      let models = this.getState('cars');
      let cars = [ model ];
      models.forEach((m) => {
        if (m.id !== model.id) {
          cars.push(model);
        }
      });


      this.setState('car', [
        ...this.getState('car'),
        model
      ]);
      this.success(`Car was updated successfully.`);
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

  /**
   * Loads car from the api and adds it to ctx.
   */
  setCar(id) {
    api.get(`/cars/${ id }`, function (err, cars) {
      if (err) {
        return this.error(err.message);
      }
      this.setState('car', cars);
    }.bind(this));
  }
}
