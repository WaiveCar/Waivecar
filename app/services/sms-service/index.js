exports = module.exports = function(config, logger) {

  var twilio = require('twilio')(config.twilio.sid, config.twilio.token);

  var methods = {

    sendMessage: function(receiverData, next) {
      return methods.message(receiverData.number, receiverData.message, next);
    },

    message: function(number, body, next) {
      if (!number) return next(new Error('No destination number given.'));
      twilio.sendMessage({
        to: number,
        from: config.twilio.number,
        body: body
      }, function (err, responseData) {
        if (err) return next(err);
        if (!responseData) return next(new Error('No response provided.'));
        if (responseData.status === 400) return next(new Error(responseData.message));

        return next();
      });
    }
  };

  return methods;
};

module.exports['@singleton'] = true;
module.exports['@require'] = [
  'igloo/settings',
  'igloo/logger'
];
