'use strict';

let error          = Bento.Error;
let User           = Bento.model('User');
let Booking        = Bento.model('Booking');

Bento.Register.Controller('DashboardController', function(controller) {


  controller.index = function *() {

    var oneWeekAgo = new Date(new Date() - 24 * 60 * 60 * 1000 * 7);

    var nowQuery = {};

    var weekAgoQuery = { where : { created_at: { $lt: oneWeekAgo }}};


    var bookingsCount = {
      now: yield Booking.count(nowQuery),
      weekAgo: yield Booking.count(weekAgoQuery)
    };

    var usersCount = {
      now: yield User.count(nowQuery),
      weekAgo: yield User.count(weekAgoQuery)
    };

    return {
      bookingsCount : bookingsCount,
      usersCount : usersCount
    }
  };


  return controller;

});
