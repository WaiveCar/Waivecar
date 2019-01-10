let scheduler = Bento.provider('queue').scheduler;
let WaiveworkPayment = Bento.model('WaiveworkPayment');
let OrderService = Bento.module('shop/lib/order-service');
let moment = require('moment');

scheduler.process('waivework-auto-charge', function*(job) {
  console.log('auto-charge here');
  let today = moment();
  //today = today.add(5, 'days');
  console.log(today);
  let todaysPayments = yield WaiveworkPayment.find({
    where: {
      date: {$gt: today.format('YYYY-MM-DD')},
    },
  });
  console.log('todays payments: ', todaysPayments);
});

module.exports = function*() {
  scheduler.add('waivework-auto-charge', {
    init: true,
    repeat: true,
    timer: {value: 24, type: 'seconds'},
  });
};
