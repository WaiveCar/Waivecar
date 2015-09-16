'use strict';

module.exports = function *() {
  yield require('./jobs');
  yield require('./locations');
  yield require('./cars');
};