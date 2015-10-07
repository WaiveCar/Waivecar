'use strict';

let commander = Reach.module('commander');
let redis     = Reach.Redis;

commander.hook('redis', function *(command) {
  switch (command) {
    case 'flushall' : return yield redis.flushall();
  }
});