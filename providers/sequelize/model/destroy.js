'use strict';

let Relations = require('../helpers').Relations;

module.exports = function *(options) {
  return yield this._schema.destroy(
    Object.assign(
      {force: true},
      options
    )
  );
};
