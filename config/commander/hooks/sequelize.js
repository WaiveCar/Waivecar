'use strict';

let commander = Reach.module('commander');
let sequelize = Reach.service('sequelize/commander');

commander.hook('sequelize', function *(command) {
  return yield sequelize(command);
});