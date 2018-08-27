'use strict';

let scheduler = Bento.provider('queue').scheduler;
let notify = require('../../lib/notification-service');

scheduler.process('parking-notify-expiration', function*(job) {

});
