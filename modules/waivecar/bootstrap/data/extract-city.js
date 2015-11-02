'use strict';

let _    = require('lodash');
let fs   = require('co-fs');
let path = require('path');

module.exports = function *() {
  let filePath = path.join(Bento.ROOT_PATH, 'modules', 'waivecar', 'bootstrap', 'data');
  let all = path.join(filePath, 'charging-stations-us.json');

  if (yield fs.exists(all)) {
    let data = JSON.parse(yield fs.readFile(all));
    let city = _.filter(data['fuel_stations'], function(s) {
      return (s.city === 'Los Angeles');
    });

    fs.writeFile(path.join(filePath, 'charging-stations-la.json'), JSON.stringify(city));
  }
};