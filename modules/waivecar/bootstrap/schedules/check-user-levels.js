'use strict';

let scheduler = Bento.provider('queue').scheduler;
let Booking = Bento.model('Booking');
let User = Bento.model('User');

module.exports = function*() {
  scheduler.add('check-user-levels', {
    init: true,
    repeat: true,
    timer: {value: 10, type: 'seconds'},
  });
};

scheduler.process('check-user-levels', function*(job) {
  console.log('check user levels here');
});
