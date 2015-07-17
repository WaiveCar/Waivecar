'use strict';

module.exports = function *() {
  yield require('./database')();
  yield require('./models')();
};