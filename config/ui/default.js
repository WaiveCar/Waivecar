'use strict';

let path = require('path');

module.exports = {
  ui : {
    ui : {
      resources : {
        contents : require('./resources/contents'),
        views    : require('./resources/views')
      },
      fields : {
        contents : require('./fields/contents'),
        views    : require('./fields/views')
      }
    },
    fixtures : {
      contents : path.join(Reach.ROOT_PATH, 'fixtures', 'contents.json'),
      views    : path.join(Reach.ROOT_PATH, 'fixtures', 'views.json')
    }
  }
};
