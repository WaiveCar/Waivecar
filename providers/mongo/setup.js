'use strict';

let mongo    = require('mongodb').MongoClient;
let provider = Bento.provider('mongo');
let config   = Bento.config.mongo;

module.exports = function *() {
  provider.db = yield new Promise((resolve, reject) => {
    mongo.connect(`mongodb://${ config.host }:${ config.port }/${ config.database }`, (err, db) => {
      if (err) {
        return reject(err);
      }
      resolve(db);
    });
  });
};
