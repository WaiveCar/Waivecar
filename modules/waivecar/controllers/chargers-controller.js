'use strict';

let service = require('../lib/chargers-service');
let error = Bento.Error;
let Location = Bento.model('Location');
let _ = require('lodash');

Bento.Register.Controller('ChargersController', function(controller) {
    /**
     * Fetch api versions
     * @return {Object}
     */
    controller.chargers = function *() {
        //return yield service.authorize();
        return yield service.list();
    };

    controller.unlock = function *(id){
        return yield service.unlock(id);
    };
    return controller;
});
