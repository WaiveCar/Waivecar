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
        return (yield Location.find({ where:
            {
                type: { $in: ['hub', 'zone', 'homebase'] }
                // only return entries after the date below ... we are considering
                // all the older ones to essentially be bullshit
                //created_at: { $gt: new Date(2017, 8, 1) }
            }
            })).map((row) => {
                if(row.shape) {
            row.shape = JSON.parse(row.shape);
        }
        return row;
    });
    };

    return controller;
});
