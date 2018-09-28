'use strict';

let service = require('../lib/chargers-service');

Bento.Register.Controller('ChargersController', function(controller) {
    controller.chargers = function *() {
        return yield service.list();
    };

    controller.start = function *(id, charger){
        return yield service.start(id, charger);
    };

    return controller;
});
