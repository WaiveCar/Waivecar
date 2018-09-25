'use strict';
let scheduler = Bento.provider('queue').scheduler;
let Car = Bento.model('Car');

scheduler.process('have-cars-moved', function *(job) {
  console.log('have cars moved process');
});

module.exports = function*() {
  let timerObj = {value: 15, type: 'seconds'};
  scheduler.add('have-cars-moved', {
    init: true,
    repeat: true,
    timer: timerObj, 
  });
};
