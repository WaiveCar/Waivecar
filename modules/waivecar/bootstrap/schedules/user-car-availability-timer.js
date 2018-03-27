'use strict';

let notify    = require('../../lib/notification-service');

let scheduler = Bento.provider('queue').scheduler;
let Car       = Bento.model('Car');
let User       = Bento.model('User');
let UserCarNotification  = Bento.model('UserCarNotification');
let geolib    = require('geolib');


let THRESHOLD = 5;//

function isCloseToUser(car, user, threshold) {
  let distance = geolib.getDistance({ latitude : car.latitude, longitude : car.longitude }, {latitude: user.latitude, longitude: user.longitude});
  let miles = distance * 0.000621371;
  return miles <= threshold;
}

scheduler.process('user-car-availability-timer', function *(job) {
  let cars = yield Car.find({isAvailable: true});
  if (!cars) {
    return;
  }

  let userNotifications = yield UserCarNotification.find();

  if (!userNotifications) {
    return;
  }

  for (let i = 0;  i < userNotifications.length; i++) {
    let userNotification = userNotifications[i];

    let closeCars = cars.filter(function(car) {return isCloseToUser(car, userNotification, THRESHOLD)});
    if (closeCars.length > 0) {
      yield notify.sendPushNotification(user_id, `There are now available cars in your region`);
      userNotification.notified = true;
      yield userNotification.save();
    };
  };

  yield UserCarNotification.destroy({
    where: {notified: true}
  });
});

module.exports = function *() {
  scheduler.add('user-car-availability-timer', {
    init   : true,
    repeat : true,
    silent : true,
    timer  : {
      value : 1,
      type  : 'minutes'
    }
  });
};
