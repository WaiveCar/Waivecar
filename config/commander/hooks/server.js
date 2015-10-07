'use strict';

let path      = require('path');
let exec      = require('child_process').exec;
let commander = Reach.module('commander');
let log       = Reach.Log;

commander.hook('server', function *(command) {
  switch (command) {
    case 'reload' : return yield reload(); break;
  }
});

function *reload() {
  log.debug('Commander > Reloading Server');
  return yield new Promise(function (resolve, reject) {
    exec('pm2 reload all', function (err, stdout, stderr) {
      if (err !== null) {
        let error = stderr.trim();
        return reject({
          status  : 400,
          code    : 'COMMANDER_ERROR',
          message : error.replace('error: ', ''),
          data    : {
            cmd : err.cmd
          }
        });
      }
      log.debug('\n' + stdout);
      resolve();
    });
  });
}