'use strict';

let commander = Reach.module('commander');
let sequelize = Reach.provider('sequelize/commander');

commander.hook('sequelize', function *(command) {
  return yield sequelize(command);
});