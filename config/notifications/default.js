module.exports = {

  /*
   |--------------------------------------------------------------------------------
   | Notification reasons
   |--------------------------------------------------------------------------------
   |
   | The various reasons a client may want to send a notification directly. Not intended
   | to be used by scheduled notifications
   |
   */
  notification : {
    reasons : {
      OUTSIDE_RANGE : `Hi there, looks like you are driving your WaiveCar outside of Santa Monica. As a reminder, all rentals must be completed in Santa Monica, and the max driving range is 20 miles from WaiveCar HQ. Thanks & enjoy your drive!`,
      LOW_CHARGE    : `Hey there! Looks like your WaiveCar battery is getting really low. Please head to a charger ASAP. You can locate the nearest ones in the app.`,
      NEAR_END      : `Hi there, your free WaiveCar rental period ends in about 15 minutes. After the free period is over, rentals are $5.99 / hour. Enjoy!`
    }
  }
};
