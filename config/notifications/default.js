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
      OUTSIDE_RANGE : [ 'Hi there! Seems like you\'ve just driven outside of WaiveCar\'s max driving range.',
                        'We don\'t want you to get stuck or not be able to return the car in our return zone',
                        'so please turn back at your earliest convenience.' ].join(' '),
      LOW_CHARGE : [ 'Hey there! Looks like your WaiveCar battery is getting really low. Please head to a',
                    'charger ASAP. You can locate the nearest ones in the app.' ].join(' ')
    }
  }
};
