'use strict';

let fs     = require('node-fs');
let path   = require('path');
let config = Bento.config.file;

module.exports = function *() {
  try {
    fs.statSync(config.providers.local.path);
  } catch (err) {
    if (err.code === 'ENOENT') {
      fs.mkdirSync(config.providers.local.path, '0777', true);
    } else {
      throw err;
    }
  }
};
