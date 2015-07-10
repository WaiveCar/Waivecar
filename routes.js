var bootable = require('bootable');

exports = module.exports = function(IoC, config, logger) {

  var app = this;
  logger.debug('registering routes');
  app.phase(bootable.di.routes('./routes/media.js'));
  app.phase(bootable.di.routes('./routes/migrations.js'));
  app.phase(bootable.di.routes('./routes/roles.js'));
  app.phase(bootable.di.routes('./routes/settings.js'));
  app.phase(bootable.di.routes('./routes/notifications.js'));
  app.phase(bootable.di.routes('./routes/users.js'));
  app.phase(bootable.di.routes('./routes/status.js'));
  app.phase(bootable.di.routes('./routes/logs.js'));
  app.phase(bootable.di.routes('./routes/blacklisted-emails.js'));
  app.phase(bootable.di.routes('./routes/auth.js'));
  app.phase(bootable.di.routes('./routes/vehicles.js'));
  app.phase(bootable.di.routes('./routes/bookings.js'));
  app.phase(bootable.di.routes('./routes/payment-web-hooks.js'));

  if (app.io) {
    app.io.sockets.on('connection', IoC.create('controllers/sockets-controller'));
  }

  // error handler (always keep this last)
  app.phase(function() {
    var errorHandler = IoC.create('lib/error-handler');
    app.use(errorHandler);
  });

};

exports['@require'] = [ '$container', 'igloo/settings', 'igloo/logger' ];
