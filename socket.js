'use strict';

let path   = require('path');
let server = require('bentojs-socket');
let config = require('bentojs-config');

// ### Bento
// Expose bento on the global scope.

global.Bento = module.exports = {};

// ### Paths
// Absolute paths to the various core concept folders of the bento api.

Bento.ROOT_PATH      = path.join(__dirname);
Bento.CONFIG_PATH    = path.join(Bento.ROOT_PATH, 'config');
Bento.INTERFACE_PATH = path.join(Bento.ROOT_PATH, 'interface');
Bento.MODULE_PATH    = path.join(Bento.ROOT_PATH, 'modules');
Bento.POLICY_PATH    = path.join(Bento.ROOT_PATH, 'policies');
Bento.PROVIDER_PATH  = path.join(Bento.ROOT_PATH, 'providers');
Bento.HOOKS_PATH     = path.join(Bento.ROOT_PATH, 'hooks');
Bento.STORAGE_PATH   = path.join(Bento.ROOT_PATH, 'storage');
Bento.TEST_PATH      = path.join(Bento.ROOT_PATH, 'test');

// ### Configuration

config = config(path.resolve('./config'));

// ### Server

server(config.socket);
