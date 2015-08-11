'use strict';

let commander = Reach.module('commander');

commander.hook('process', function *(command) {
  switch (command) {
    case 'kill' : process.exit(0); break;
  }
});