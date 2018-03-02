'use strict';

let request = require('co-request');
let error = Bento.Error;
let config = Bento.config;
let _ = require('lodash');


const CHARGER_ID_BASE = 9999;

module.exports = {

    /**
     * Fetch api versions
     * */
  *getVersions() {
    let url = 'https://evgotest.driivz.com/externalIncoming/ocpi/cpo/versions';

    let reqResponse = yield request({
        url     : url,
        method  : 'GET',
        headers : {
            Referer : config.api.uri,
            Accept  : 'application/json',
            Authorization: 'Token ' + config.evgo.token
        }
    });

    let versionUrlsArray = JSON.parse(reqResponse.body).data;

    let latestVersion = versionUrlsArray[versionUrlsArray.length - 1].url;

    let response = yield request({
        url     : latestVersion,
        method  : 'GET',
        headers : {
            Referer : config.api.uri,
            Accept  : 'application/json',
            Authorization: 'Token ' + config.evgo.token
        }
    });

    return response.body;
  },

  *authorize() {
    let versionsData = yield this.getVersions();
    let versions = JSON.parse(versionsData).data.endpoints;


    let credentialsUrl = _.filter(versions, function (endpoint) {
        return  endpoint.identifier === 'credentials';
     })[0];

     let response = yield request({
         url: credentialsUrl.url,
         method: 'POST',
         headers: {
             Referer: config.api.uri,
             Accept: 'application/json'
         },
         body: JSON.stringify({
             token: 'test_token',
             country_code: "US",
             url: config.api.uri
         })
     });

     return response.body;
    },

    *list() {
        //mocked token

        let response = yield request({
            url     : 'https://evgotest.driivz.com/externalIncoming/ocpi/cpo/2.1.1/locations',
            method  : 'GET',
            headers : {
                Referer : config.api.uri,
                Accept  : 'application/json',
                Authorization: 'Token dsakjrh3447sdfgs32985sd'
            }
        });

        let result = JSON.parse(response.body);


        //get first and put it inside szone

        let locations = (result.data || []).map(function(loc) {

            return {
                id: 'charger_' + loc.id,
                address: loc.address,
                type: 'charging-station',
                latitude: loc.coordinates.latitude,
                longitude: loc.coordinates.longitude,
                name: loc.name
            }
        });

        return locations;
    }
};
