let scheduler = Bento.provider('queue').scheduler;

scheduler.process('waivework-reminder', function*(job) {
  console.log('in process');
});
