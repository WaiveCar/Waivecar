'use strict';

let service = require('../lib/evgo-service');
let error = Bento.Error;
let Location = Bento.model('Location');
let _ = require('lodash');

Bento.Register.Controller('EvgoController', function(controller) {
    /**
     * Fetch api versions
     * @return {Object}
     */
    controller.chargers = function *() {
        //return yield service.authorize();

        //for test
        return (yield Location.find({
            where: {type: { $in: ['station']}}
        }));
    };
    return controller;
});
