var path = require('path');
var IoC = require('electrolyte');
var bootable = require('bootable');
var express = require('express');
var cluster = require('cluster');

// change the working directory to the root directory
process.chdir(__dirname);

// dependency injection
IoC.loader(IoC.node(path.join(__dirname, 'boot')));
IoC.loader('igloo', require('igloo'));
IoC.loader('lib', IoC.node(path.join(__dirname, 'lib')));
IoC.loader('middleware', IoC.node(path.join(__dirname, 'middleware')));
IoC.loader('controllers', IoC.node(path.join(__dirname, 'app', 'controllers')));
IoC.loader('handlers', IoC.node(path.join(__dirname, 'app', 'services', 'job-service', 'handlers')));
IoC.loader('models', IoC.node(path.join(__dirname, 'app', 'models')));
IoC.loader('policies', IoC.node(path.join(__dirname, 'app', 'policies')));
IoC.loader('services', IoC.node(path.join(__dirname, 'app', 'services')));

// phases
var app = bootable(express());
app.phase(bootable.di.initializers());
app.phase(bootable.di.routes());

if (cluster.isMaster) {
  app.phase(bootable.di.initializers(path.join(__dirname, 'etc', 'data')));
}

app.phase(IoC.create('igloo/server'));

// boot
var logger = IoC.create('igloo/logger');
var settings = IoC.create('igloo/settings');

app.boot(function(err) {
  if (err) {
    logger.error(err.message);
    if (settings.showStack) logger.error(err.stack);

    process.exit(-1);
    return;
  }

  logger.info('app booted');
});

exports = module.exports = app;
