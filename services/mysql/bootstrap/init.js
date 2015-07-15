'use strict';

let database = require('./database');
let models   = require('./models');

module.exports = function *() {
  yield database();
  yield models();
};