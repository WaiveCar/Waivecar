'use strict';

let error = Bento.Error;
let User = Bento.model('User');
let Booking = Bento.model('Booking');
let WaiveworkPayment = Bento.model('WaiveworkPayment');
let Car = Bento.model('Car');

Bento.Register.Controller('DashboardController', function(controller) {
  controller.index = function*() {
    var oneWeekAgo = new Date(new Date() - 24 * 60 * 60 * 1000 * 7);

    var nowQuery = {};

    var weekAgoQuery = {where: {created_at: {$lt: oneWeekAgo}}};

    var bookingsCount = {
      now: yield Booking.count(nowQuery),
      weekAgo: yield Booking.count(weekAgoQuery),
    };

    var usersCount = {
      now: yield User.count(nowQuery),
      weekAgo: yield User.count(weekAgoQuery),
    };

    let currentWaiveworkBookingsCount = yield WaiveworkPayment.count({
      where: {bookingPaymentId: null},
    });
    let carsInRepairCount = yield Car.count({where: {inRepair: true}});
    let carsAvailableCount = yield Car.count({where: {isAvailable: true}});
    let allCars = yield Car.find();
    let carsInWaivework = [];
    for (let car of allCars) {
      if (yield car.hasTag('waivework')) {
        carsInWaivework.push(car);
      }
    }

    return {
      bookingsCount: bookingsCount,
      usersCount: usersCount,
      currentWaiveworkBookingsCount,
      carsInRepairCount,
      carsInWaiveworkCount: carsInWaivework.length,
    };
  };

  return controller;
});
