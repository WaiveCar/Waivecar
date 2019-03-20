let scheduler = Bento.provider('queue').scheduler;

scheduler.process('waivework-billing', function*(job) {
  console.log('data: ', job.data);
});
