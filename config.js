'use strict';

var fs         = require('fs');
var path       = require('path');
var extend     = require('extend');

// ### Paths

var configPath = path.join(__dirname, 'config');
var targetPath = path.join(__dirname, 'src', 'config.js');

// ### Config

var env     = process.env.NODE_ENV;
var configs = fs.readdirSync(configPath);
var config  = {};

configs.forEach(function (category) {
  var defaultFile = path.join(configPath, category, 'default.js');
  var envFile     = path.join(configPath, category, env + '.js');
  if (fs.existsSync(defaultFile)) {
    config = extend(true, config, require(defaultFile));
  }
  if (fs.existsSync(envFile)) {
    config = extend(true, config, require(envFile));
  }
});

// ### Write
// Create a configuration file at the targetPath location.

fs.writeFileSync(targetPath, ('module.exports = ' + JSON.stringify(config)));

// ### Export

module.exports = config;