'use strict';

Bento.Register.Controller('SmsController', function(controller) {

  /**
   * Creates a new waivecar report.
   * @return {Object}
   */
  controller.response = function *() {
    this.type = 'application/xml';
    return `<?xml version="1.0" encoding="UTF-8" ?>
<Response>
    <Message>Texts to this number are not monitored. To reach us, call or text us at 855-WAIVE55</Message>
</Response>`;
  };

  return controller;

});
