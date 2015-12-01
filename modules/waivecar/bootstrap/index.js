'use strict';

module.exports = function *() {
  yield require('./jobs');
  yield require('./cars');
  yield require('./homebase');
  yield require('./stations');
  yield require('./valets');
};
