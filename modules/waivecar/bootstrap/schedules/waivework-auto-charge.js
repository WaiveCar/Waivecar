let scheduler = Bento.provider('queue').scheduler;

scheduler.process('waivework-auto-charge', function*(job) {
  console.log('auto-charge here');
});

module.exports = function*() {
  scheduler.add('waivework-auto-charge', {
    init: true,
    repeat: true,
    timer: {value: 24, type: 'seconds'},
  });
};
